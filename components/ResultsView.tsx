"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { SlidersHorizontal, Sparkles, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { OutfitVisual } from "@/components/OutfitVisual";
import { RecommendationCard } from "@/components/RecommendationCard";
import {
  aestheticOptions,
  budgetRangeOptions,
  fitPreferenceOptions,
  occasionOptions,
} from "@/data/mock-data";
import {
  getRealOutfitPacksForBrief,
  getRealPackBudgetSummary,
  getRealProductsForOutfitPack,
} from "@/data/realOutfitPacks";
import { products } from "@/data/products";
import {
  clearStoredQuizAnswers,
  normalizeQuizAnswers,
  readServerSavedLooks,
  readServerStoredQuizAnswers,
  readSavedLooks,
  readStoredQuizAnswers,
  subscribeSavedLooks,
  subscribeStoredQuizAnswers,
  writeSavedLookIds,
  writeSavedLooks,
  writeStoredQuizAnswers,
} from "@/lib/local-storage";
import {
  formatAestheticLabel,
  formatCurrency,
  formatOptionLabel,
  getOccasionResultsDescriptor,
  getUseCaseLabel,
  splitCommaSeparated,
} from "@/lib/utils";
import { buildOutfitRecommendations, hasQuizAnswers } from "@/utils/outfitMatcher";
import type {
  Aesthetic,
  BudgetRange,
  ColorFamily,
  FitPreference,
  Occasion,
  OutfitRecommendation,
  QuizAnswers,
  RealOutfitPack,
  RealProduct,
  SavedLookSnapshot,
} from "@/types";

type ResultsViewProps = {
  searchParamsObject?: Partial<Record<keyof QuizAnswers, string>>;
};

type ResultsSort = "best-match" | "lowest-price" | "highest-confidence" | "creator-ready";
type ResultsViewMode = "all" | "saved";
type BudgetViewMode = "balanced" | "stay-under";

type ResultsFilters = {
  aesthetic: Aesthetic | "";
  occasion: Occasion | "";
  maxBudget: BudgetRange | "";
  fit: FitPreference | "";
  store: string;
  colorFamily: ColorFamily | "";
};

type SavedLookVisualItem = {
  category: "top" | "bottom" | "shoes" | "accessory" | "outerwear";
  name: string;
};

type ResolvedRealOutfitPack = RealOutfitPack & {
  products: RealProduct[];
  stores: string[];
  budgetSummary: string;
};

const allAestheticOptions = Array.from(
  new Set([
    ...aestheticOptions,
    ...products.flatMap((product) => product.aestheticTags),
  ]),
) as Aesthetic[];

const allOccasionOptions = Array.from(
  new Set([
    ...occasionOptions,
    ...products.flatMap((product) => product.occasionTags),
  ]),
) as Occasion[];

const allStoreOptions = Array.from(new Set(products.map((product) => product.store))).sort();

const allColorFamilyOptions = Array.from(
  new Set(products.map((product) => product.colorFamily)),
).sort((left, right) => formatOptionLabel(left).localeCompare(formatOptionLabel(right)));

const sortOptions: Array<{ value: ResultsSort; label: string }> = [
  { value: "best-match", label: "Best match" },
  { value: "lowest-price", label: "Lowest price" },
  { value: "highest-confidence", label: "Highest confidence" },
  { value: "creator-ready", label: "Occasion focus" },
];

const emptySavedLooks: SavedLookSnapshot[] = [];

const savedColorMap: Record<string, string> = {
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
};

function buildBaseFilters(answers: QuizAnswers | null): ResultsFilters {
  return {
    aesthetic: answers?.aesthetic ?? "",
    occasion: answers?.occasion ?? "",
    maxBudget: answers?.budgetRange ?? "",
    fit: answers?.fitPreference ?? "",
    store: "",
    colorFamily: "",
  };
}

function sameFilters(left: ResultsFilters, right: ResultsFilters) {
  return (
    left.aesthetic === right.aesthetic &&
    left.occasion === right.occasion &&
    left.maxBudget === right.maxBudget &&
    left.fit === right.fit &&
    left.store === right.store &&
    left.colorFamily === right.colorFamily
  );
}

function mergeLeadingValue(primary: string, source: string) {
  const values = [primary, ...splitCommaSeparated(source)]
    .map((entry) => entry.trim())
    .filter(Boolean);

  return Array.from(new Set(values)).join(", ");
}

function splitDisplayValues(value?: string) {
  return (value ?? "")
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function getActiveFilterChips(
  filters: ResultsFilters,
  stylePreference: QuizAnswers["stylePreference"] = "",
) {
  return [
    filters.aesthetic
      ? {
          label: "Aesthetic",
          value: formatAestheticLabel(filters.aesthetic, stylePreference),
        }
      : null,
    filters.occasion ? { label: "Occasion", value: formatOptionLabel(filters.occasion) } : null,
    filters.maxBudget ? { label: "Budget", value: formatOptionLabel(filters.maxBudget) } : null,
    filters.fit ? { label: "Fit", value: formatOptionLabel(filters.fit) } : null,
    filters.store ? { label: "Store", value: filters.store } : null,
    filters.colorFamily
      ? { label: "Color family", value: formatOptionLabel(filters.colorFamily) }
      : null,
  ].filter(Boolean) as Array<{ label: string; value: string }>;
}

function sortRecommendations(recommendations: OutfitRecommendation[], sort: ResultsSort) {
  const sorted = [...recommendations];

  sorted.sort((left, right) => {
    if (sort === "lowest-price") {
      return left.totalPrice - right.totalPrice || right.confidenceScore - left.confidenceScore;
    }

    if (sort === "highest-confidence") {
      return right.confidenceScore - left.confidenceScore || left.totalPrice - right.totalPrice;
    }

    if (sort === "creator-ready") {
      const creatorMomentSelected =
        left.occasion === "reels" ||
        left.occasion === "photoshoot" ||
        left.occasion === "brand content";

      return (
        (creatorMomentSelected
          ? right.creatorAlignmentScore - left.creatorAlignmentScore
          : 0) ||
        right.confidenceScore - left.confidenceScore ||
        left.totalPrice - right.totalPrice
      );
    }

    return (
      right.confidenceScore - left.confidenceScore ||
      right.creatorAlignmentScore - left.creatorAlignmentScore ||
      left.totalPrice - right.totalPrice
    );
  });

  return sorted;
}

function buildSavedLookSnapshot(
  recommendation: OutfitRecommendation,
  answers: QuizAnswers | null,
): SavedLookSnapshot {
  return {
    ...recommendation,
    savedAt: new Date().toISOString(),
    stylePreference: answers?.stylePreference ?? "",
    briefSummary: {
      name: answers?.name ?? "",
      stylePreference: answers?.stylePreference ?? "",
      location: answers?.location ?? "",
      aesthetic: answers?.aesthetic ?? "",
      occasion: answers?.occasion ?? "",
      budgetRange: answers?.budgetRange ?? "",
      fitPreference: answers?.fitPreference ?? "",
      preferredColors: splitCommaSeparated(answers?.preferredColors),
      storesLike: splitCommaSeparated(answers?.storesLike),
    },
  };
}

function formatSavedAt(savedAt: string) {
  const date = new Date(savedAt);

  if (Number.isNaN(date.getTime())) {
    return "Saved recently";
  }

  return `Saved ${date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })}`;
}

function describeBudgetPersonality(budgetRange?: BudgetRange | "") {
  if (budgetRange === "under $100") {
    return "value-first and practical";
  }

  if (budgetRange === "$100-$200") {
    return "budget-conscious with room for one polished upgrade";
  }

  if (budgetRange === "$200-$350") {
    return "balanced premium without overspending";
  }

  if (budgetRange === "$350+") {
    return "premium-flexible and quality-led";
  }

  return "open-budget and flexible";
}

function describeColorMood(preferredColors: string[]) {
  if (preferredColors.length === 0) {
    return "open palette";
  }

  if (preferredColors.length === 1) {
    return `${formatOptionLabel(preferredColors[0])} focus`;
  }

  return `${preferredColors.slice(0, 3).map(formatOptionLabel).join(", ")} mood`;
}

function describeSizeFitNotes(answers: QuizAnswers) {
  const notes = [
    answers.fitPreference ? `${formatOptionLabel(answers.fitPreference)} fit` : "",
    answers.topSize ? `top ${answers.topSize}` : "",
    answers.bottomSize ? `bottom ${answers.bottomSize}` : "",
    answers.shoeSize ? `shoe ${answers.shoeSize}` : "",
  ].filter(Boolean);

  return notes.length > 0 ? notes.join(" • ") : "Open sizing notes";
}

function buildStyleDnaSummary(
  answers: QuizAnswers,
  preferredColors: string[],
  preferredStores: string[],
) {
  const aesthetic = answers.aesthetic
    ? `${formatAestheticLabel(answers.aesthetic, answers.stylePreference).toLowerCase()} base`
    : "flexible aesthetic base";
  const fit = answers.fitPreference
    ? `${formatOptionLabel(answers.fitPreference).toLowerCase()} fit`
    : "open fit direction";
  const colorMood =
    preferredColors.length > 0
      ? `${preferredColors.slice(0, 3).map((color) => formatOptionLabel(color).toLowerCase()).join(", ")} colors`
      : "an open color palette";
  const stores =
    preferredStores.length > 0
      ? `${preferredStores.slice(0, 2).join(" + ")} store mix`
      : "an open store mix";
  const occasion =
    answers.occasion && answers.occasion !== "daily wear"
      ? `${getOccasionResultsDescriptor(answers.occasion)} flexibility`
      : "everyday flexibility";

  return `Your Style DNA: ${aesthetic}, ${fit}, ${colorMood}, ${stores}, and ${occasion}.`;
}

function getSavedLookPalette(savedLook: Partial<SavedLookSnapshot> | null | undefined) {
  const palette = Array.isArray(savedLook?.colorPalette)
    ? savedLook.colorPalette.filter((color): color is string => Boolean(color))
    : [];

  return palette.length > 0 ? palette : ["cream", "stone", "charcoal", "taupe"];
}

function getSavedLookVisualItems(
  savedLook: Partial<SavedLookSnapshot> | null | undefined,
): SavedLookVisualItem[] {
  const items = savedLook?.items as
    | Partial<Record<SavedLookVisualItem["category"], { name?: string } | null | undefined>>
    | undefined;

  const visualItems = [
    items?.top?.name ? { category: "top", name: items.top.name } : null,
    items?.bottom?.name ? { category: "bottom", name: items.bottom.name } : null,
    items?.shoes?.name ? { category: "shoes", name: items.shoes.name } : null,
    items?.accessory?.name ? { category: "accessory", name: items.accessory.name } : null,
    items?.outerwear?.name ? { category: "outerwear", name: items.outerwear.name } : null,
  ].filter(Boolean) as SavedLookVisualItem[];

  if (visualItems.length > 0) {
    return visualItems;
  }

  return [
    { category: "top", name: "Saved top" },
    { category: "bottom", name: "Saved bottom" },
    { category: "shoes", name: "Saved shoes" },
  ];
}

function getSavedLookStores(savedLook: Partial<SavedLookSnapshot> | null | undefined) {
  return Array.isArray(savedLook?.stores)
    ? savedLook.stores.filter((store): store is string => Boolean(store)).slice(0, 2)
    : [];
}

function getSavedLookItemSummary(
  savedLook: Partial<SavedLookSnapshot> | null | undefined,
): Array<{ label: string; value: string }> {
  const items = savedLook?.items as
    | Partial<Record<SavedLookVisualItem["category"], { name?: string } | null | undefined>>
    | undefined;

  const summary = [
    items?.top?.name ? { label: "Top", value: items.top.name } : null,
    items?.bottom?.name ? { label: "Bottom", value: items.bottom.name } : null,
    items?.shoes?.name ? { label: "Shoes", value: items.shoes.name } : null,
    items?.accessory?.name ? { label: "Accessory", value: items.accessory.name } : null,
    items?.outerwear?.name ? { label: "Outerwear", value: items.outerwear.name } : null,
  ].filter(Boolean) as Array<{ label: string; value: string }>;

  if (summary.length > 0) {
    return summary;
  }

  return [
    { label: "Top", value: "Saved look details unavailable" },
    { label: "Bottom", value: "Snapshot uses an older FitMuse format" },
    { label: "Shoes", value: "Visual fallback is shown safely" },
  ];
}

export function ResultsView({ searchParamsObject = {} }: ResultsViewProps) {
  const router = useRouter();
  const searchSignature = useMemo(() => JSON.stringify(searchParamsObject), [searchParamsObject]);
  const searchAnswers = useMemo(() => {
    const normalized = normalizeQuizAnswers(
      JSON.parse(searchSignature) as Partial<Record<keyof QuizAnswers, string>>,
    );

    return hasQuizAnswers(normalized) ? normalized : null;
  }, [searchSignature]);

  const rawStoredQuizAnswers = useSyncExternalStore(
    subscribeStoredQuizAnswers,
    readStoredQuizAnswers,
    readServerStoredQuizAnswers,
  );
  const rawSavedLooks = useSyncExternalStore(
    subscribeSavedLooks,
    readSavedLooks,
    readServerSavedLooks,
  );
  const [hasHydrated, setHasHydrated] = useState(false);
  const quizAnswers = searchAnswers ?? (hasHydrated ? rawStoredQuizAnswers : null);
  const savedLooks = hasHydrated ? rawSavedLooks : emptySavedLooks;
  const [filters, setFilters] = useState<ResultsFilters>(buildBaseFilters(searchAnswers));
  const [sort, setSort] = useState<ResultsSort>("best-match");
  const [viewMode, setViewMode] = useState<ResultsViewMode>("all");
  const [budgetViewMode, setBudgetViewMode] = useState<BudgetViewMode>("balanced");
  const [selectedSavedLookId, setSelectedSavedLookId] = useState<string | null>(null);
  const [selectedRealPackId, setSelectedRealPackId] = useState<string | null>(null);
  const [highlightedLookId, setHighlightedLookId] = useState<string | null>(null);
  const [savedLooksMessage, setSavedLooksMessage] = useState("");
  const [pendingOpenSavedLookId, setPendingOpenSavedLookId] = useState<string | null>(null);
  const filtersSeedRef = useRef("");
  const highlightTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const savedMessageTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const frameId = window.requestAnimationFrame(() => {
      setHasHydrated(true);
    });

    return () => window.cancelAnimationFrame(frameId);
  }, []);

  useEffect(() => {
    if (searchAnswers && hasQuizAnswers(searchAnswers)) {
      writeStoredQuizAnswers(searchAnswers);
    }
  }, [searchAnswers]);

  useEffect(() => {
    const nextKey = [
      quizAnswers?.aesthetic ?? "",
      quizAnswers?.occasion ?? "",
      quizAnswers?.budgetRange ?? "",
      quizAnswers?.fitPreference ?? "",
    ].join("|");

    if (filtersSeedRef.current === nextKey) {
      return;
    }

    const nextFilters = buildBaseFilters(quizAnswers);
    filtersSeedRef.current = nextKey;
    setFilters((current) => (sameFilters(current, nextFilters) ? current : nextFilters));
  }, [
    quizAnswers,
    quizAnswers?.aesthetic,
    quizAnswers?.occasion,
    quizAnswers?.budgetRange,
    quizAnswers?.fitPreference,
  ]);

  const effectiveAnswers = useMemo(() => {
    if (!quizAnswers) {
      return null;
    }

    return {
      ...quizAnswers,
      aesthetic: filters.aesthetic || quizAnswers.aesthetic,
      occasion: filters.occasion || quizAnswers.occasion,
      budgetRange: filters.maxBudget || quizAnswers.budgetRange,
      fitPreference: filters.fit || quizAnswers.fitPreference,
      storesLike: filters.store
        ? mergeLeadingValue(filters.store, quizAnswers.storesLike)
        : quizAnswers.storesLike,
    } satisfies QuizAnswers;
  }, [filters, quizAnswers]);

  const recommendations = useMemo(
    () => (effectiveAnswers ? buildOutfitRecommendations(effectiveAnswers, 10) : []),
    [effectiveAnswers],
  );

  const recommendationLookup = useMemo(
    () => new Map(recommendations.map((recommendation) => [recommendation.id, recommendation])),
    [recommendations],
  );

  const filteredRecommendations = useMemo(() => {
    return recommendations.filter((recommendation) => {
      if (
        filters.store &&
        !recommendation.stores.some(
          (store) => store.toLowerCase() === filters.store.toLowerCase(),
        )
      ) {
        return false;
      }

      if (
        filters.colorFamily &&
        !recommendation.colorFamilies.some((family) => family === filters.colorFamily)
      ) {
        return false;
      }

      return true;
    });
  }, [filters.colorFamily, filters.store, recommendations]);

  const sortedRecommendations = useMemo(
    () => sortRecommendations(filteredRecommendations, sort),
    [filteredRecommendations, sort],
  );
  const visibleRecommendations = useMemo(() => {
    if (budgetViewMode === "stay-under") {
      return sortedRecommendations.filter(
        (recommendation) => recommendation.budgetMatchLabel === "Within budget",
      );
    }

    return sortedRecommendations;
  }, [budgetViewMode, sortedRecommendations]);

  const savedRecommendations = useMemo(
    () =>
      [...savedLooks].sort(
        (left, right) =>
          new Date(right.savedAt).getTime() - new Date(left.savedAt).getTime(),
      ),
    [savedLooks],
  );

  const curatedRealOutfitPacks = useMemo<ResolvedRealOutfitPack[]>(() => {
    if (!quizAnswers) {
      return [];
    }

    return getRealOutfitPacksForBrief({
      stylePreference: quizAnswers.stylePreference,
      aesthetic: quizAnswers.aesthetic,
      occasion: quizAnswers.occasion,
      budgetRange: quizAnswers.budgetRange,
    })
      .map((pack) => {
        const packProducts = getRealProductsForOutfitPack(pack.productIds);

        return {
          ...pack,
          products: packProducts,
          stores: Array.from(new Set(packProducts.map((product) => product.store))),
          budgetSummary: getRealPackBudgetSummary(pack.totalPrice, pack.budgetRange),
        };
      })
      .filter((pack) => pack.products.length > 0);
  }, [quizAnswers]);

  const savedLookIds = useMemo(() => savedRecommendations.map((savedLook) => savedLook.id), [
    savedRecommendations,
  ]);

  const activeFilterChips = getActiveFilterChips(filters, quizAnswers?.stylePreference ?? "");
  const weakRecommendationCount = visibleRecommendations.filter(
    (recommendation) => recommendation.confidenceScore < 55,
  ).length;
  const isClosestOnly =
    visibleRecommendations.length > 0 &&
    weakRecommendationCount >= Math.ceil(visibleRecommendations.length * 0.6);
  const resultsDescriptor = getOccasionResultsDescriptor(
    filters.occasion || quizAnswers?.occasion || "",
  );
  const preferredColors = splitCommaSeparated(quizAnswers?.preferredColors);
  const preferredStores = splitDisplayValues(quizAnswers?.storesLike);
  const topRecommendation = visibleRecommendations[0] ?? sortedRecommendations[0] ?? null;
  const styleDnaSummary = quizAnswers
    ? buildStyleDnaSummary(quizAnswers, preferredColors, preferredStores)
    : "";
  const budgetPersonality = describeBudgetPersonality(quizAnswers?.budgetRange ?? "");
  const colorMood = describeColorMood(preferredColors);
  const fitSizeNotes = quizAnswers ? describeSizeFitNotes(quizAnswers) : "Open sizing notes";
  const selectedSavedLook = useMemo(
    () =>
      selectedSavedLookId
        ? savedRecommendations.find((savedLook) => savedLook.id === selectedSavedLookId) ?? null
        : null,
    [savedRecommendations, selectedSavedLookId],
  );
  const selectedRealPack = useMemo(
    () =>
      selectedRealPackId
        ? curatedRealOutfitPacks.find((pack) => pack.id === selectedRealPackId) ?? null
        : null,
    [curatedRealOutfitPacks, selectedRealPackId],
  );
  const canViewSelectedSavedLookInCurrentResults = Boolean(
    selectedSavedLook && recommendationLookup.has(selectedSavedLook.id),
  );

  function persistSavedLooks(next: SavedLookSnapshot[]) {
    writeSavedLooks(next);
    writeSavedLookIds(next.map((savedLook) => savedLook.id));
  }

  function setTemporarySavedLooksMessage(message: string) {
    setSavedLooksMessage(message);

    if (savedMessageTimeoutRef.current) {
      clearTimeout(savedMessageTimeoutRef.current);
    }

    savedMessageTimeoutRef.current = setTimeout(() => {
      setSavedLooksMessage("");
      savedMessageTimeoutRef.current = null;
    }, 2800);
  }

  function highlightLookCard(recommendationId: string) {
    if (typeof document === "undefined") {
      return false;
    }

    const targetCard = document.getElementById(`look-${recommendationId}`);

    if (!targetCard) {
      return false;
    }

    targetCard.scrollIntoView({ behavior: "smooth", block: "center" });
    setHighlightedLookId(recommendationId);

    if (highlightTimeoutRef.current) {
      clearTimeout(highlightTimeoutRef.current);
    }

    highlightTimeoutRef.current = setTimeout(() => {
      setHighlightedLookId((current) => (current === recommendationId ? null : current));
      highlightTimeoutRef.current = null;
    }, 2600);

    return true;
  }

  function handleFilterChange<K extends keyof ResultsFilters>(key: K, value: ResultsFilters[K]) {
    setFilters((current) => {
      const next = { ...current, [key]: value };
      return sameFilters(current, next) ? current : next;
    });
  }

  function resetFiltersToBrief() {
    const nextFilters = buildBaseFilters(quizAnswers);
    setFilters((current) => (sameFilters(current, nextFilters) ? current : nextFilters));
  }

  function toggleSave(id: string) {
    const alreadySaved = savedLooks.some((savedLook) => savedLook.id === id);

    const next = alreadySaved
      ? savedLooks.filter((savedLook) => savedLook.id !== id)
      : (() => {
          const recommendation = recommendationLookup.get(id);

          if (!recommendation) {
            return savedLooks;
          }

          const snapshot = buildSavedLookSnapshot(recommendation, quizAnswers);
          return [snapshot, ...savedLooks.filter((savedLook) => savedLook.id !== id)];
        })();

    if (alreadySaved && selectedSavedLookId === id) {
      setSelectedSavedLookId(null);
    }

    persistSavedLooks(next);
  }

  function handleStartNewQuiz() {
    clearStoredQuizAnswers();
    setFilters(buildBaseFilters(null));
    router.push("/quiz");
  }

  function handleOpenSavedLook(savedLookId: string) {
    setSelectedSavedLookId(savedLookId);
  }

  function handleViewSavedLookInCurrentResults(savedLookId: string) {
    if (!recommendationLookup.has(savedLookId)) {
      setTemporarySavedLooksMessage("This saved look is not part of your current results set.");
      return;
    }

    setSelectedSavedLookId(null);
    setViewMode("all");
    setBudgetViewMode("balanced");
    setPendingOpenSavedLookId(savedLookId);
    setFilters((current) => {
      const next = buildBaseFilters(quizAnswers);
      return sameFilters(current, next) ? current : next;
    });
  }

  useEffect(() => {
    if (!pendingOpenSavedLookId || viewMode !== "all") {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      if (
        sortedRecommendations.some(
          (recommendation) => recommendation.id === pendingOpenSavedLookId,
        )
      ) {
        if (highlightLookCard(pendingOpenSavedLookId)) {
          setPendingOpenSavedLookId(null);
        }

        return;
      }

      if (recommendations.length === 0) {
        return;
      }

      setTemporarySavedLooksMessage("This saved look is not part of your current results set.");
      setPendingOpenSavedLookId(null);
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [pendingOpenSavedLookId, recommendations, sortedRecommendations, viewMode]);

  useEffect(() => {
    return () => {
      if (highlightTimeoutRef.current) {
        clearTimeout(highlightTimeoutRef.current);
      }

      if (savedMessageTimeoutRef.current) {
        clearTimeout(savedMessageTimeoutRef.current);
      }
    };
  }, []);

  if (!quizAnswers) {
    return (
      <section className="grid gap-6">
        <div className="glass-panel p-6 sm:p-8">
          <p className="eyebrow">Results</p>
          <h1 className="section-title max-w-4xl">
            Take the Style Quiz first so FitMuse can build looks around you.
          </h1>
          <p className="mt-4 max-w-2xl">
            FitMuse needs your measurements, occasion, budget, and fit direction before it can rank complete outfits.
          </p>
          <div className="mt-8">
            <Link href="/quiz" className="cta-primary">
              Take Style Quiz
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="grid gap-6">
      <div className="glass-panel p-4 sm:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="eyebrow !mb-0">Results</p>
            <h1 className="mt-3 text-3xl text-foreground sm:text-4xl">
              {viewMode === "all" ? "All Looks" : "Saved Looks"}
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
              {viewMode === "all"
                ? "Browse your ranked outfit recommendations, then save the looks worth comparing later."
                : "Looks you saved in this browser."}
            </p>
          </div>

          <div className="inline-flex w-full rounded-full border border-line/70 bg-background/72 p-1 sm:w-auto">
            <button
              type="button"
              onClick={() => setViewMode("all")}
              className={`flex-1 rounded-full px-4 py-3 text-sm font-semibold transition sm:flex-none ${
                viewMode === "all"
                  ? "bg-foreground text-white shadow-[0_10px_24px_rgba(27,21,19,0.14)]"
                  : "text-foreground"
              }`}
            >
              All Looks
            </button>
            <button
              type="button"
              onClick={() => setViewMode("saved")}
              className={`flex-1 rounded-full px-4 py-3 text-sm font-semibold transition sm:flex-none ${
                viewMode === "saved"
                  ? "bg-foreground text-white shadow-[0_10px_24px_rgba(27,21,19,0.14)]"
                  : "text-foreground"
              }`}
            >
              Saved Looks
              <span
                className={`ml-2 rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                  viewMode === "saved" ? "bg-white/18 text-white" : "bg-white text-foreground"
                }`}
              >
                {savedRecommendations.length}
              </span>
            </button>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <span className="pill">
            {savedRecommendations.length} saved {savedRecommendations.length === 1 ? "look" : "looks"}
          </span>
          {viewMode === "all" ? (
            <span className="pill">{visibleRecommendations.length} ranked recommendations</span>
          ) : null}
        </div>

        <div aria-live="polite" className="mt-4 min-h-6">
          {savedLooksMessage ? (
            <p className="text-sm font-medium text-accent-2">{savedLooksMessage}</p>
          ) : null}
        </div>
      </div>

      {viewMode === "all" ? (
        <>
          <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              className="dark-panel flex h-full flex-col gap-6 p-6 sm:p-8"
            >
              <div>
                <p className="eyebrow !mb-0 text-accent-3">Your Style Brief</p>
                <h2 className="mt-4 text-4xl leading-tight text-white sm:text-5xl">
                  Styled for:{" "}
                  {[
                    quizAnswers.aesthetic
                      ? formatAestheticLabel(quizAnswers.aesthetic, quizAnswers.stylePreference)
                      : "",
                    quizAnswers.occasion ? formatOptionLabel(quizAnswers.occasion) : "",
                    quizAnswers.budgetRange ? formatOptionLabel(quizAnswers.budgetRange) : "",
                  ]
                    .filter(Boolean)
                    .join(" / ")}
                </h2>
                <p className="mt-4 max-w-2xl text-white/72">
                  {quizAnswers.fitPreference
                    ? `FitMuse is ranking looks around your ${formatOptionLabel(quizAnswers.fitPreference)} fit preference.`
                    : `FitMuse is prioritizing ${resultsDescriptor} looks around your style brief.`}
                </p>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  {[
                    {
                      label: "Aesthetic",
                      value: quizAnswers.aesthetic
                        ? formatAestheticLabel(quizAnswers.aesthetic, quizAnswers.stylePreference)
                        : "Open",
                    },
                    { label: "Occasion", value: quizAnswers.occasion || "Open" },
                    { label: "Budget", value: quizAnswers.budgetRange || "Flexible" },
                    { label: "Fit preference", value: quizAnswers.fitPreference || "Open" },
                  ].map((item) => (
                    <div key={item.label} className="rounded-[1.35rem] border border-white/12 bg-white/10 p-4">
                      <p className="mini-label !text-white/62">{item.label}</p>
                      <p className="mt-2 text-sm text-white/92">
                        {item.label === "Aesthetic" ? item.value : formatOptionLabel(item.value)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  { label: "Style preference", value: quizAnswers.stylePreference || "Open" },
                  { label: "Location", value: quizAnswers.location || "Not set" },
                  {
                    label: "Top / bottom",
                    value: `${quizAnswers.topSize || "?"} / ${quizAnswers.bottomSize || "?"}`,
                  },
                  { label: "Shoe size", value: quizAnswers.shoeSize || "Not set" },
                ].map((item) => (
                  <div key={item.label} className="rounded-[1.35rem] border border-white/12 bg-white/10 p-4">
                    <p className="mini-label !text-white/62">{item.label}</p>
                    <p className="mt-2 text-sm text-white/92">{formatOptionLabel(item.value)}</p>
                  </div>
                ))}
              </div>

              <div className="rounded-[1.5rem] border border-white/12 bg-white/8 p-5">
                <p className="mini-label !text-white/62">Color + store direction</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {(preferredColors.length > 0 ? preferredColors.slice(0, 4) : ["Open palette"]).map(
                    (color) => (
                      <span key={color} className="rounded-full bg-white/12 px-3 py-2 text-sm text-white/92">
                        {formatOptionLabel(color)}
                      </span>
                    ),
                  )}
                </div>
                <p className="mt-4 text-sm leading-6 text-white/72">
                  {quizAnswers.storesLike
                    ? `Preferred stores: ${quizAnswers.storesLike}.`
                    : "No store lock-in yet, so FitMuse is mixing the strongest mock products across the catalog."}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {(preferredStores.length > 0 ? preferredStores.slice(0, 4) : ["Any store"]).map(
                    (store) => (
                      <span key={store} className="rounded-full bg-black/12 px-3 py-2 text-sm text-white/88">
                        {store === "Any store" ? store : `Store: ${store}`}
                      </span>
                    ),
                  )}
                </div>
              </div>

              <div className="rounded-[1.5rem] border border-white/12 bg-white/10 p-5">
                <p className="mini-label !text-white/62">Style DNA</p>
                <p className="mt-3 text-sm leading-6 text-white/82">{styleDnaSummary}</p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-[1.2rem] border border-white/10 bg-black/10 p-4">
                    <p className="mini-label !text-white/58">Budget personality</p>
                    <p className="mt-2 text-sm text-white/92">{budgetPersonality}</p>
                  </div>
                  <div className="rounded-[1.2rem] border border-white/10 bg-black/10 p-4">
                    <p className="mini-label !text-white/58">Preferred color mood</p>
                    <p className="mt-2 text-sm text-white/92">{colorMood}</p>
                  </div>
                  <div className="rounded-[1.2rem] border border-white/10 bg-black/10 p-4">
                    <p className="mini-label !text-white/58">Avoided colors</p>
                    <p className="mt-2 text-sm text-white/92">
                      {quizAnswers.avoidColors
                        ? splitCommaSeparated(quizAnswers.avoidColors)
                            .map((color) => formatOptionLabel(color))
                            .join(", ")
                        : "None set"}
                    </p>
                  </div>
                  <div className="rounded-[1.2rem] border border-white/10 bg-black/10 p-4">
                    <p className="mini-label !text-white/58">Size / fit notes</p>
                    <p className="mt-2 text-sm text-white/92">{fitSizeNotes}</p>
                  </div>
                </div>
                {topRecommendation ? (
                  <div className="mt-4 rounded-[1.2rem] border border-white/10 bg-black/12 p-4">
                    <p className="mini-label !text-white/58">Styling summary</p>
                    <p className="mt-2 text-sm leading-6 text-white/88">
                      {topRecommendation.stylingSummary}
                    </p>
                  </div>
                ) : null}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.04, ease: [0.22, 1, 0.36, 1] }}
              className="glass-panel p-6 sm:p-8"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="eyebrow !mb-0">Refine your pack</p>
                  <h2 className="mt-3 text-4xl text-foreground">Tune the recommendation mix.</h2>
                  <p className="mt-3 max-w-2xl">
                    Adjust the aesthetic, occasion, spend cap, store, or color-family direction without rebuilding your whole quiz.
                  </p>
                </div>
                <button type="button" onClick={handleStartNewQuiz} className="cta-secondary">
                  Start New Quiz
                </button>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                <div>
                  <label htmlFor="results-aesthetic" className="mini-label">
                    Aesthetic
                  </label>
                  <select
                    id="results-aesthetic"
                    value={filters.aesthetic}
                    onChange={(event) =>
                      handleFilterChange("aesthetic", event.target.value as ResultsFilters["aesthetic"])
                    }
                    className="filter-select mt-2"
                  >
                    <option value="">Any aesthetic</option>
                    {allAestheticOptions.map((option) => (
                      <option key={option} value={option}>
                        {formatAestheticLabel(option, quizAnswers.stylePreference)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="results-occasion" className="mini-label">
                    Occasion
                  </label>
                  <select
                    id="results-occasion"
                    value={filters.occasion}
                    onChange={(event) =>
                      handleFilterChange("occasion", event.target.value as ResultsFilters["occasion"])
                    }
                    className="filter-select mt-2"
                  >
                    <option value="">Any occasion</option>
                    {allOccasionOptions.map((option) => (
                      <option key={option} value={option}>
                        {formatOptionLabel(option)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="results-budget" className="mini-label">
                    Max budget
                  </label>
                  <select
                    id="results-budget"
                    value={filters.maxBudget}
                    onChange={(event) =>
                      handleFilterChange("maxBudget", event.target.value as ResultsFilters["maxBudget"])
                    }
                    className="filter-select mt-2"
                  >
                    <option value="">Flexible</option>
                    {budgetRangeOptions.map((option) => (
                      <option key={option} value={option}>
                        {formatOptionLabel(option)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="results-fit" className="mini-label">
                    Fit
                  </label>
                  <select
                    id="results-fit"
                    value={filters.fit}
                    onChange={(event) =>
                      handleFilterChange("fit", event.target.value as ResultsFilters["fit"])
                    }
                    className="filter-select mt-2"
                  >
                    <option value="">Any fit</option>
                    {fitPreferenceOptions.map((option) => (
                      <option key={option} value={option}>
                        {formatOptionLabel(option)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="results-store" className="mini-label">
                    Store
                  </label>
                  <select
                    id="results-store"
                    value={filters.store}
                    onChange={(event) => handleFilterChange("store", event.target.value)}
                    className="filter-select mt-2"
                  >
                    <option value="">Any store</option>
                    {allStoreOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="results-color-family" className="mini-label">
                    Color family
                  </label>
                  <select
                    id="results-color-family"
                    value={filters.colorFamily}
                    onChange={(event) =>
                      handleFilterChange("colorFamily", event.target.value as ResultsFilters["colorFamily"])
                    }
                    className="filter-select mt-2"
                  >
                    <option value="">Any color family</option>
                    {allColorFamilyOptions.map((option) => (
                      <option key={option} value={option}>
                        {formatOptionLabel(option)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <span className="pill">
                  <SlidersHorizontal size={14} />
                  {activeFilterChips.length} active filters
                </span>
                {activeFilterChips.map((chip) => (
                  <span key={`${chip.label}-${chip.value}`} className="chip">
                    {chip.label}: {chip.value}
                  </span>
                ))}
                <button type="button" onClick={resetFiltersToBrief} className="cta-secondary">
                  Reset to brief
                </button>
              </div>

              <div className="mt-6 rounded-[1.5rem] border border-line/70 bg-background/70 p-4 sm:p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="mini-label">Sort looks</p>
                    <p className="mt-2 text-sm text-foreground">
                      Keep the grid focused on the kind of result you want first.
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="inline-flex rounded-full border border-line/70 bg-white/82 p-1">
                      <button
                        type="button"
                        onClick={() => setBudgetViewMode("balanced")}
                        className={`rounded-full px-3 py-2 text-xs font-semibold transition ${
                          budgetViewMode === "balanced"
                            ? "bg-foreground text-white"
                            : "text-foreground"
                        }`}
                      >
                        Balanced mix
                      </button>
                      <button
                        type="button"
                        onClick={() => setBudgetViewMode("stay-under")}
                        className={`rounded-full px-3 py-2 text-xs font-semibold transition ${
                          budgetViewMode === "stay-under"
                            ? "bg-foreground text-white"
                            : "text-foreground"
                        }`}
                      >
                        Stay under budget
                      </button>
                    </div>
                    <select
                      value={sort}
                      onChange={(event) => setSort(event.target.value as ResultsSort)}
                      className="filter-select max-w-xs"
                    >
                      {sortOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {isClosestOnly ? (
            <div className="soft-card">
              <div className="flex items-start gap-3">
                <span className="mt-1 rounded-full bg-accent-4 p-3 text-accent-2">
                  <Sparkles size={18} />
                </span>
                <div>
                  <p className="mini-label">Closest matches</p>
                  <h2 className="mt-3 text-3xl text-foreground">
                    No perfect match yet - these are the closest looks to your style brief.
                  </h2>
                  <p className="mt-3 max-w-3xl">
                    FitMuse is still prioritizing the strongest aesthetic, budget, and color overlap instead of leaving you with a blank page.
                  </p>
                </div>
              </div>
            </div>
          ) : null}

          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow !mb-0">Results</p>
              <h2 className="mt-3 text-4xl text-foreground">
                {visibleRecommendations.length} {resultsDescriptor}{" "}
                {visibleRecommendations.length === 1 ? "look" : "looks"} ranked for your brief.
              </h2>
              <p className="mt-3 max-w-2xl">
                FitMuse is balancing fit, occasion, colors, stores, spend range, and style intelligence using the current curated mock catalog.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="pill">{sortOptions.find((option) => option.value === sort)?.label}</span>
              {filters.maxBudget ? <span className="pill">{formatOptionLabel(filters.maxBudget)}</span> : null}
              <span className="pill">
                {budgetViewMode === "stay-under" ? "Stay under budget" : "Balanced mix"}
              </span>
            </div>
          </div>

          {visibleRecommendations.length === 0 ? (
            <div className="glass-panel p-6 sm:p-8">
              <p className="mini-label">No looks in current filter mix</p>
              <h2 className="mt-3 text-4xl text-foreground">Try widening one filter to bring more looks back.</h2>
              <p className="mt-4 max-w-2xl">
                {budgetViewMode === "stay-under"
                  ? "The current brief has no fully within-budget looks under this filter mix. Switch back to Balanced mix to see the closest near-budget options too."
                  : "The recommendation engine still has mock inventory, but the current combination of store, color family, fit, and budget is too narrow."}
              </p>
              <div className="mt-6">
                <div className="flex flex-wrap gap-3">
                  <button type="button" onClick={resetFiltersToBrief} className="cta-primary">
                    Reset to brief
                  </button>
                  {budgetViewMode === "stay-under" ? (
                    <button
                      type="button"
                      onClick={() => setBudgetViewMode("balanced")}
                      className="cta-secondary"
                    >
                      View balanced mix
                    </button>
                  ) : null}
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="grid gap-6 xl:grid-cols-2">
                {visibleRecommendations.map((recommendation) => (
                  <RecommendationCard
                    key={recommendation.id}
                    cardId={`look-${recommendation.id}`}
                    highlighted={highlightedLookId === recommendation.id}
                    recommendation={recommendation}
                    saved={savedLookIds.includes(recommendation.id)}
                    onToggleSave={toggleSave}
                    stylePreference={quizAnswers.stylePreference}
                  />
                ))}
              </div>

              {curatedRealOutfitPacks.length > 0 ? (
                <div className="hero-card p-5 sm:p-6">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="eyebrow !mb-0">Curated real shopping looks</p>
                      <h3 className="mt-3 text-3xl text-foreground">
                        Manually curated packs for this brief.
                      </h3>
                      <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">
                        These packs sit alongside the mock engine so FitMuse can start testing real
                        shopping workflows one scenario at a time.
                      </p>
                    </div>
                    <span className="pill">{curatedRealOutfitPacks.length} curated packs</span>
                  </div>

                  <div className="mt-6 grid gap-4 xl:grid-cols-2">
                    {curatedRealOutfitPacks.map((pack) => (
                      <div
                        key={pack.id}
                        className="rounded-[1.7rem] border border-line/70 bg-white/82 p-5 shadow-[0_18px_40px_rgba(27,21,19,0.06)]"
                      >
                        <div className="flex flex-wrap gap-2">
                          <span className="chip">
                            {formatAestheticLabel(pack.aesthetic, pack.targetStylePreference)}
                          </span>
                          <span className="chip">{formatOptionLabel(pack.occasion)}</span>
                          <span className="chip">{pack.budgetSummary}</span>
                        </div>

                        <div className="mt-4 flex items-start justify-between gap-4">
                          <div>
                            <p className="mini-label">Curated pack</p>
                            <h4 className="mt-2 text-2xl text-foreground">{pack.name}</h4>
                          </div>
                          <div className="rounded-full border border-line/70 bg-background/80 px-4 py-2 text-sm font-semibold text-foreground">
                            {formatCurrency(pack.totalPrice)}
                          </div>
                        </div>

                        <div className="mt-4 flex flex-wrap gap-2">
                          {pack.stores.map((store) => (
                            <span key={`${pack.id}-${store}`} className="pill">
                              {store}
                            </span>
                          ))}
                        </div>

                        <div className="mt-5 grid gap-3">
                          {pack.products.map((product) => (
                            <div
                              key={product.id}
                              className="flex items-center justify-between gap-3 rounded-[1.2rem] border border-line/70 bg-background/72 px-4 py-3"
                            >
                              <div>
                                <p className="mini-label">{formatOptionLabel(product.category)}</p>
                                <p className="mt-1 text-sm text-foreground">{product.name}</p>
                              </div>
                              <p className="text-sm font-medium text-foreground">
                                {formatCurrency(product.currentPrice)}
                              </p>
                            </div>
                          ))}
                        </div>

                        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                          <p className="text-sm leading-6 text-muted">{pack.whyItWorks}</p>
                          <button
                            type="button"
                            onClick={() => setSelectedRealPackId(pack.id)}
                            className="cta-primary"
                          >
                            Shop Full Look
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              <div className="rounded-[1.4rem] border border-line/70 bg-white/74 px-5 py-4">
                <p className="text-sm leading-6 text-muted">
                  FitMuse currently uses curated mock data for MVP testing. Real shopping links and
                  affiliate product feeds can be connected in a future version.
                </p>
              </div>
            </>
          )}
        </>
      ) : savedRecommendations.length > 0 ? (
        <div className="hero-card p-5 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="eyebrow !mb-0">Saved Looks</p>
              <h2 className="mt-3 text-4xl text-foreground">
                {savedRecommendations.length} saved {savedRecommendations.length === 1 ? "look" : "looks"}.
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">
                Looks you saved in this browser.
              </p>
            </div>
            <button type="button" onClick={() => setViewMode("all")} className="cta-secondary">
              View Recommendations
            </button>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {savedRecommendations.map((savedLook) => (
              <div
                key={`saved-${savedLook.id}-${savedLook.savedAt}`}
                className="rounded-[1.6rem] border border-line/70 bg-white/82 p-4 shadow-[0_18px_40px_rgba(27,21,19,0.06)] sm:p-5"
              >
                <OutfitVisual
                  title={savedLook.name}
                  subtitle={`${savedLook.confidenceScore}% confidence`}
                  palette={getSavedLookPalette(savedLook)}
                  items={getSavedLookVisualItems(savedLook)}
                  stores={getSavedLookStores(savedLook)}
                  compact
                  className="min-h-[22rem]"
                />

                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="chip">
                    {formatAestheticLabel(savedLook.aesthetic, savedLook.stylePreference)}
                  </span>
                  <span className="chip">{formatOptionLabel(savedLook.occasion)}</span>
                  {savedLook.stylePreference ? (
                    <span className="chip">{formatOptionLabel(savedLook.stylePreference)}</span>
                  ) : null}
                </div>

                <div className="mt-4">
                  <p className="mini-label">{formatSavedAt(savedLook.savedAt)}</p>
                  <h3 className="mt-2 text-2xl text-foreground">{savedLook.name}</h3>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="chip">{formatCurrency(savedLook.totalPrice)}</span>
                  <span className="chip">{savedLook.budgetMatchLabel}</span>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-2">
                  {getSavedLookPalette(savedLook).slice(0, 4).map((color) => (
                    <span
                      key={`${savedLook.id}-${savedLook.savedAt}-${color}`}
                      className="inline-flex items-center gap-2 rounded-full border border-line/70 bg-background/72 px-3 py-2 text-xs font-medium text-foreground"
                    >
                      <span
                        className="h-3 w-3 rounded-full border border-black/10"
                        style={{ backgroundColor: savedColorMap[color.toLowerCase()] ?? "#ddd2bf" }}
                      />
                      {formatOptionLabel(color)}
                    </span>
                  ))}
                </div>

                <div className="mt-5 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => handleOpenSavedLook(savedLook.id)}
                    aria-label={`Open saved look: ${savedLook.name}`}
                    data-testid={`open-saved-look-${savedLook.id}`}
                    className="cta-primary"
                  >
                    Open Look
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleSave(savedLook.id)}
                    className="cta-secondary"
                  >
                    Unsave
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="glass-panel p-6 sm:p-8">
          <p className="eyebrow">Saved Looks</p>
          <h2 className="mt-3 text-4xl text-foreground">No saved looks yet.</h2>
          <p className="mt-4 max-w-2xl">
            Save outfits from your recommendations to compare them later.
          </p>
          <div className="mt-6">
            <button type="button" onClick={() => setViewMode("all")} className="cta-primary">
              View Recommendations
            </button>
          </div>
        </div>
      )}

      {selectedSavedLook ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#181311]/52 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-[2rem] border border-line/70 bg-background p-6 shadow-[0_30px_80px_rgba(27,21,19,0.28)] sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="eyebrow !mb-0">Saved Look</p>
                <h2 className="mt-3 text-3xl text-foreground sm:text-4xl">{selectedSavedLook.name}</h2>
                <p className="mt-3 text-sm text-muted">{formatSavedAt(selectedSavedLook.savedAt)}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedSavedLookId(null)}
                className="rounded-full border border-line/70 bg-white/82 p-3 text-foreground"
                aria-label="Close saved look details"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              <span className="chip">
                {formatAestheticLabel(selectedSavedLook.aesthetic, selectedSavedLook.stylePreference)}
              </span>
              <span className="chip">{formatOptionLabel(selectedSavedLook.occasion)}</span>
              {selectedSavedLook.stylePreference ? (
                <span className="chip">{formatOptionLabel(selectedSavedLook.stylePreference)}</span>
              ) : null}
              <span className="chip">{selectedSavedLook.budgetMatchLabel}</span>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <div className="rounded-[1.4rem] border border-line/70 bg-white/82 p-4">
                <p className="mini-label">Total price</p>
                <p className="mt-2 text-xl text-foreground">{formatCurrency(selectedSavedLook.totalPrice)}</p>
              </div>
              <div className="rounded-[1.4rem] border border-line/70 bg-white/82 p-4">
                <p className="mini-label">Confidence</p>
                <p className="mt-2 text-xl text-foreground">{selectedSavedLook.confidenceScore}%</p>
              </div>
              <div className="rounded-[1.4rem] border border-line/70 bg-white/82 p-4">
                <p className="mini-label">Saved from brief</p>
                <p className="mt-2 text-sm text-foreground">
                  {selectedSavedLook.briefSummary?.aesthetic
                    ? `${formatAestheticLabel(selectedSavedLook.briefSummary.aesthetic, selectedSavedLook.stylePreference)} / ${formatOptionLabel(selectedSavedLook.briefSummary.occasion || "")}`
                    : "Saved from a previous FitMuse brief"}
                </p>
              </div>
            </div>

            <div className="mt-6">
              <OutfitVisual
                title={selectedSavedLook.name}
                subtitle={`${selectedSavedLook.confidenceScore}% confidence`}
                palette={getSavedLookPalette(selectedSavedLook)}
                items={getSavedLookVisualItems(selectedSavedLook)}
                stores={getSavedLookStores(selectedSavedLook)}
                className="min-h-[24rem]"
              />
            </div>

            <div className="mt-6 rounded-[1.5rem] border border-line/70 bg-white/78 p-5">
              <p className="mini-label">Color palette</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {getSavedLookPalette(selectedSavedLook).map((color) => (
                  <span
                    key={`modal-${selectedSavedLook.id}-${color}`}
                    className="inline-flex items-center gap-2 rounded-full border border-line/70 bg-background/72 px-3 py-2 text-xs font-medium text-foreground"
                  >
                    <span
                      className="h-3 w-3 rounded-full border border-black/10"
                      style={{ backgroundColor: savedColorMap[color.toLowerCase()] ?? "#ddd2bf" }}
                    />
                    {formatOptionLabel(color)}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-6 grid gap-3">
              {getSavedLookItemSummary(selectedSavedLook).map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center justify-between gap-3 rounded-[1.3rem] border border-line/70 bg-white/78 px-4 py-3"
                  >
                    <p className="mini-label">{item.label}</p>
                    <p className="text-right text-sm text-foreground">{item.value}</p>
                  </div>
                ))}
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div className="rounded-[1.5rem] border border-line/70 bg-white/78 p-5">
                <p className="mini-label">Fit note</p>
                <p className="mt-3 text-sm leading-6 text-foreground">{selectedSavedLook.fitNote}</p>
              </div>
              <div className="rounded-[1.5rem] border border-line/70 bg-white/78 p-5">
                <p className="mini-label">Why it works</p>
                <p className="mt-3 text-sm leading-6 text-foreground">{selectedSavedLook.whyItWorks}</p>
              </div>
            </div>

            <div className="mt-6 rounded-[1.5rem] border border-line/70 bg-white/78 p-5">
              <p className="mini-label">{getUseCaseLabel(selectedSavedLook.occasion)}</p>
              <p className="mt-3 text-sm leading-6 text-foreground">{selectedSavedLook.creatorUseCase}</p>
            </div>

            <div className="mt-6 rounded-[1.5rem] border border-line/70 bg-white/78 p-5">
              <p className="mini-label">Match reasons</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {selectedSavedLook.matchReasons.map((reason) => (
                  <span key={`${selectedSavedLook.id}-${reason}`} className="chip">
                    {reason}
                  </span>
                ))}
              </div>
            </div>

            {selectedSavedLook.briefSummary ? (
              <div className="mt-6 rounded-[1.5rem] border border-line/70 bg-white/78 p-5">
                <p className="mini-label">Original brief snapshot</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {selectedSavedLook.briefSummary.stylePreference ? (
                    <span className="chip">
                      {formatOptionLabel(selectedSavedLook.briefSummary.stylePreference)}
                    </span>
                  ) : null}
                  {selectedSavedLook.briefSummary.aesthetic ? (
                    <span className="chip">
                      {formatAestheticLabel(
                        selectedSavedLook.briefSummary.aesthetic,
                        selectedSavedLook.stylePreference,
                      )}
                    </span>
                  ) : null}
                  {selectedSavedLook.briefSummary.occasion ? (
                    <span className="chip">
                      {formatOptionLabel(selectedSavedLook.briefSummary.occasion)}
                    </span>
                  ) : null}
                  {selectedSavedLook.briefSummary.budgetRange ? (
                    <span className="chip">
                      {formatOptionLabel(selectedSavedLook.briefSummary.budgetRange)}
                    </span>
                  ) : null}
                  {selectedSavedLook.briefSummary.fitPreference ? (
                    <span className="chip">
                      {formatOptionLabel(selectedSavedLook.briefSummary.fitPreference)}
                    </span>
                  ) : null}
                </div>
              </div>
            ) : null}

            <div className="mt-8 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => setSelectedSavedLookId(null)}
                className="cta-secondary"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => toggleSave(selectedSavedLook.id)}
                className="cta-secondary"
              >
                Unsave
              </button>
              {canViewSelectedSavedLookInCurrentResults ? (
                <button
                  type="button"
                  onClick={() => handleViewSavedLookInCurrentResults(selectedSavedLook.id)}
                  className="cta-primary"
                >
                  View in current results
                </button>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}

      {selectedRealPack ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#181311]/52 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-[2rem] border border-line/70 bg-background p-6 shadow-[0_30px_80px_rgba(27,21,19,0.28)] sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="eyebrow !mb-0">Curated real shopping look</p>
                <h2 className="mt-3 text-3xl text-foreground sm:text-4xl">
                  {selectedRealPack.name}
                </h2>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">
                  Real product links are manually curated for MVP testing.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedRealPackId(null)}
                className="rounded-full border border-line/70 bg-white/82 p-3 text-foreground"
                aria-label="Close curated shopping look"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              <span className="chip">
                {formatAestheticLabel(
                  selectedRealPack.aesthetic,
                  selectedRealPack.targetStylePreference,
                )}
              </span>
              <span className="chip">{formatOptionLabel(selectedRealPack.occasion)}</span>
              <span className="chip">{formatOptionLabel(selectedRealPack.budgetRange)}</span>
              <span className="chip">{selectedRealPack.budgetSummary}</span>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <div className="rounded-[1.4rem] border border-line/70 bg-white/82 p-4">
                <p className="mini-label">Total price</p>
                <p className="mt-2 text-xl text-foreground">
                  {formatCurrency(selectedRealPack.totalPrice)}
                </p>
              </div>
              <div className="rounded-[1.4rem] border border-line/70 bg-white/82 p-4">
                <p className="mini-label">Stores</p>
                <p className="mt-2 text-sm text-foreground">{selectedRealPack.stores.join(", ")}</p>
              </div>
              <div className="rounded-[1.4rem] border border-line/70 bg-white/82 p-4">
                <p className="mini-label">Shop status</p>
                <p className="mt-2 text-sm text-foreground">
                  {selectedRealPack.shopReady ? "Manually curated for MVP review" : "Draft only"}
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-4">
              {selectedRealPack.products.map((product) => (
                <div
                  key={`real-pack-${selectedRealPack.id}-${product.id}`}
                  className="rounded-[1.5rem] border border-line/70 bg-white/78 p-5"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="mini-label">{formatOptionLabel(product.category)}</p>
                      <h3 className="mt-2 text-xl text-foreground">{product.name}</h3>
                      <p className="mt-2 text-sm text-muted">
                        {product.store} • {product.currency} {product.currentPrice}
                      </p>
                    </div>
                    <a
                      href={product.productUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="cta-secondary"
                    >
                      Replace with real link
                    </a>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {product.colors.map((color) => (
                      <span key={`${product.id}-${color}`} className="chip">
                        {formatOptionLabel(color)}
                      </span>
                    ))}
                    <span className="chip">{product.store}</span>
                  </div>

                  {product.notes ? (
                    <p className="mt-4 text-sm leading-6 text-muted">{product.notes}</p>
                  ) : null}
                </div>
              ))}
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div className="rounded-[1.5rem] border border-line/70 bg-white/78 p-5">
                <p className="mini-label">Fit note</p>
                <p className="mt-3 text-sm leading-6 text-foreground">{selectedRealPack.fitNote}</p>
              </div>
              <div className="rounded-[1.5rem] border border-line/70 bg-white/78 p-5">
                <p className="mini-label">Why it works</p>
                <p className="mt-3 text-sm leading-6 text-foreground">
                  {selectedRealPack.whyItWorks}
                </p>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => setSelectedRealPackId(null)}
                className="cta-secondary"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
