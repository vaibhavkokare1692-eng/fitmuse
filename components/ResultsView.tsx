"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { SlidersHorizontal, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { RecommendationCard } from "@/components/RecommendationCard";
import {
  aestheticOptions,
  budgetRangeOptions,
  fitPreferenceOptions,
  occasionOptions,
} from "@/data/mock-data";
import { products } from "@/data/products";
import {
  clearStoredQuizAnswers,
  normalizeQuizAnswers,
  readSavedLookIds,
  readSavedLooks,
  readStoredQuizAnswers,
  writeSavedLooks,
  writeSavedLookIds,
  writeStoredQuizAnswers,
} from "@/lib/local-storage";
import { formatCurrency, formatOptionLabel, splitCommaSeparated } from "@/lib/utils";
import { buildOutfitRecommendations, hasQuizAnswers } from "@/utils/outfitMatcher";
import type {
  Aesthetic,
  BudgetRange,
  FitPreference,
  Occasion,
  OutfitRecommendation,
  QuizAnswers,
} from "@/types";

type ResultsViewProps = {
  searchParamsObject?: Partial<Record<keyof QuizAnswers, string>>;
};

type ResultsSort = "best-match" | "lowest-price" | "highest-confidence" | "creator-ready";

type ResultsFilters = {
  aesthetic: Aesthetic | "";
  occasion: Occasion | "";
  maxBudget: BudgetRange | "";
  fit: FitPreference | "";
  store: string;
  color: string;
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

const allColorOptions = Array.from(
  new Set(products.flatMap((product) => product.colors.map((color) => color.toLowerCase()))),
).sort((left, right) => formatOptionLabel(left).localeCompare(formatOptionLabel(right)));

const sortOptions: Array<{ value: ResultsSort; label: string }> = [
  { value: "best-match", label: "Best match" },
  { value: "lowest-price", label: "Lowest price" },
  { value: "highest-confidence", label: "Highest confidence" },
  { value: "creator-ready", label: "Creator-ready" },
];

function buildBaseFilters(answers: QuizAnswers | null): ResultsFilters {
  return {
    aesthetic: answers?.aesthetic ?? "",
    occasion: answers?.occasion ?? "",
    maxBudget: answers?.budgetRange ?? "",
    fit: answers?.fitPreference ?? "",
    store: "",
    color: "",
  };
}

function sameFilters(left: ResultsFilters, right: ResultsFilters) {
  return (
    left.aesthetic === right.aesthetic &&
    left.occasion === right.occasion &&
    left.maxBudget === right.maxBudget &&
    left.fit === right.fit &&
    left.store === right.store &&
    left.color === right.color
  );
}

function mergeLeadingValue(primary: string, source: string) {
  const values = [primary, ...splitCommaSeparated(source)]
    .map((entry) => entry.trim())
    .filter(Boolean);

  return Array.from(new Set(values)).join(", ");
}

function getActiveFilterChips(filters: ResultsFilters) {
  return [
    filters.aesthetic ? { label: "Aesthetic", value: formatOptionLabel(filters.aesthetic) } : null,
    filters.occasion ? { label: "Occasion", value: formatOptionLabel(filters.occasion) } : null,
    filters.maxBudget ? { label: "Budget", value: formatOptionLabel(filters.maxBudget) } : null,
    filters.fit ? { label: "Fit", value: formatOptionLabel(filters.fit) } : null,
    filters.store ? { label: "Store", value: filters.store } : null,
    filters.color ? { label: "Color", value: formatOptionLabel(filters.color) } : null,
  ].filter(Boolean) as Array<{ label: string; value: string }>;
}

function sortRecommendations(
  recommendations: OutfitRecommendation[],
  sort: ResultsSort,
) {
  const sorted = [...recommendations];

  sorted.sort((left, right) => {
    if (sort === "lowest-price") {
      return left.totalPrice - right.totalPrice || right.confidenceScore - left.confidenceScore;
    }

    if (sort === "highest-confidence") {
      return right.confidenceScore - left.confidenceScore || left.totalPrice - right.totalPrice;
    }

    if (sort === "creator-ready") {
      return (
        right.creatorAlignmentScore - left.creatorAlignmentScore ||
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

export function ResultsView({ searchParamsObject = {} }: ResultsViewProps) {
  const router = useRouter();
  const searchSignature = useMemo(
    () => JSON.stringify(searchParamsObject),
    [searchParamsObject],
  );
  const searchAnswers = useMemo(() => {
    const normalized = normalizeQuizAnswers(
      JSON.parse(searchSignature) as Partial<Record<keyof QuizAnswers, string>>,
    );

    return hasQuizAnswers(normalized) ? normalized : null;
  }, [searchSignature]);
  const [quizAnswers, setQuizAnswers] = useState<QuizAnswers | null>(searchAnswers);
  const [savedLookIds, setSavedLookIds] = useState<string[]>([]);
  const [savedLooks, setSavedLooks] = useState<OutfitRecommendation[]>([]);
  const [filters, setFilters] = useState<ResultsFilters>(buildBaseFilters(searchAnswers));
  const [sort, setSort] = useState<ResultsSort>("best-match");
  const filtersSeedRef = useRef("");

  useEffect(() => {
    if (searchAnswers && hasQuizAnswers(searchAnswers)) {
      setQuizAnswers(searchAnswers);
      writeStoredQuizAnswers(searchAnswers);
      return;
    }

    const stored = readStoredQuizAnswers();
    setQuizAnswers(stored && hasQuizAnswers(stored) ? stored : null);
  }, [searchAnswers]);

  useEffect(() => {
    setSavedLookIds(readSavedLookIds());
    setSavedLooks(readSavedLooks());
  }, []);

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
      preferredColors: filters.color
        ? mergeLeadingValue(filters.color, quizAnswers.preferredColors)
        : quizAnswers.preferredColors,
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
        filters.color &&
        !recommendation.colorPalette.some(
          (color) => color.toLowerCase() === filters.color.toLowerCase(),
        )
        ) {
        return false;
      }

      return true;
    });
  }, [filters.color, filters.store, recommendations]);

  const sortedRecommendations = useMemo(
    () => sortRecommendations(filteredRecommendations, sort),
    [filteredRecommendations, sort],
  );

  const savedRecommendations = useMemo(() => {
    const hydrated = savedLookIds
      .map((id) => recommendationLookup.get(id) ?? savedLooks.find((savedLook) => savedLook.id === id))
      .filter(Boolean) as OutfitRecommendation[];

    const uniqueHydrated = Array.from(
      new Map(hydrated.map((recommendation) => [recommendation.id, recommendation])).values(),
    );

    return sortRecommendations(uniqueHydrated, "best-match");
  }, [recommendationLookup, savedLookIds, savedLooks]);

  const activeFilterChips = getActiveFilterChips(filters);
  const isClosestOnly =
    sortedRecommendations.length > 0 &&
    sortedRecommendations.every((recommendation) => recommendation.matchMode === "closest");

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
    const recommendation = recommendationLookup.get(id);

    setSavedLookIds((current) => {
      const next = current.includes(id)
        ? current.filter((savedId) => savedId !== id)
        : [...current, id];

      writeSavedLookIds(next);
      return next;
    });

    setSavedLooks((current) => {
      const next = current.some((savedLook) => savedLook.id === id)
        ? current.filter((savedLook) => savedLook.id !== id)
        : recommendation
          ? [recommendation, ...current.filter((savedLook) => savedLook.id !== id)]
          : current;

      writeSavedLooks(next);
      return next;
    });
  }

  function handleStartNewQuiz() {
    clearStoredQuizAnswers();
    setQuizAnswers(null);
    setFilters(buildBaseFilters(null));
    router.push("/quiz");
  }

  useEffect(() => {
    if (savedLookIds.length === 0 || recommendationLookup.size === 0) {
      return;
    }

    setSavedLooks((current) => {
      const next = savedLookIds
        .map((id) => recommendationLookup.get(id) ?? current.find((savedLook) => savedLook.id === id))
        .filter(Boolean) as OutfitRecommendation[];

      const uniqueNext = Array.from(
        new Map(next.map((recommendation) => [recommendation.id, recommendation])).values(),
      );

      const changed =
        uniqueNext.length !== current.length ||
        uniqueNext.some((recommendation, index) => {
          const currentRecommendation = current[index];

          return (
            recommendation.id !== currentRecommendation?.id ||
            recommendation.name !== currentRecommendation?.name ||
            recommendation.totalPrice !== currentRecommendation?.totalPrice ||
            recommendation.confidenceScore !== currentRecommendation?.confidenceScore
          );
        });

      if (!changed) {
        return current;
      }

      writeSavedLooks(uniqueNext);
      return uniqueNext;
    });
  }, [recommendationLookup, savedLookIds]);

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
      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="dark-panel flex h-full flex-col gap-6 p-6 sm:p-8"
        >
          <div>
            <p className="eyebrow !mb-0 text-accent-3">Your Style Brief</p>
            <h1 className="mt-4 text-4xl leading-tight text-white sm:text-5xl">
              Styled for:{" "}
              {[quizAnswers.aesthetic, quizAnswers.occasion, quizAnswers.budgetRange]
                .filter(Boolean)
                .map(formatOptionLabel)
                .join(" • ")}
            </h1>
            <p className="mt-4 max-w-2xl text-white/72">
              {quizAnswers.fitPreference
                ? `FitMuse is ranking looks around your ${formatOptionLabel(quizAnswers.fitPreference)} fit preference.`
                : "FitMuse is prioritizing creator-ready looks around your style brief."}
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {[
              { label: "Style preference", value: quizAnswers.stylePreference || "Open" },
              { label: "Location", value: quizAnswers.location || "Not set" },
              { label: "Top / bottom", value: `${quizAnswers.topSize || "?"} / ${quizAnswers.bottomSize || "?"}` },
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
              {(splitCommaSeparated(quizAnswers.preferredColors).length > 0
                ? splitCommaSeparated(quizAnswers.preferredColors).slice(0, 4)
                : ["Open palette"]
              ).map((color) => (
                <span key={color} className="rounded-full bg-white/12 px-3 py-2 text-sm text-white/92">
                  {formatOptionLabel(color)}
                </span>
              ))}
            </div>
            <p className="mt-4 text-sm leading-6 text-white/72">
              {quizAnswers.storesLike
                ? `Preferred stores: ${quizAnswers.storesLike}.`
                : "No store lock-in yet, so FitMuse is mixing the strongest mock products across the catalog."}
            </p>
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
                Adjust the aesthetic, occasion, spend cap, store, or color direction without rebuilding your whole quiz.
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
                    {formatOptionLabel(option)}
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
              <label htmlFor="results-color" className="mini-label">
                Color
              </label>
              <select
                id="results-color"
                value={filters.color}
                onChange={(event) => handleFilterChange("color", event.target.value)}
                className="filter-select mt-2"
              >
                <option value="">Any color</option>
                {allColorOptions.map((option) => (
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
        </motion.div>
      </div>

      {savedRecommendations.length > 0 ? (
        <div className="hero-card p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="eyebrow !mb-0">Saved Looks</p>
              <h2 className="mt-3 text-3xl text-foreground">
                {savedRecommendations.length} saved {savedRecommendations.length === 1 ? "look" : "looks"} ready to revisit.
              </h2>
            </div>
            <p className="text-sm">
              Saved looks stay in this browser so you can compare before you shop later.
            </p>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {savedRecommendations.map((recommendation) => (
              <div
                key={`saved-${recommendation.id}`}
                className="rounded-[1.5rem] border border-line/70 bg-white/82 p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="mini-label">{recommendation.matchQualityLabel}</p>
                    <h3 className="mt-2 text-2xl text-foreground">{recommendation.name}</h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleSave(recommendation.id)}
                    className="cta-secondary"
                  >
                    Unsave
                  </button>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="chip">{formatCurrency(recommendation.totalPrice)}</span>
                  <span className="chip">{recommendation.budgetMatchLabel}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {isClosestOnly ? (
        <div className="soft-card">
          <div className="flex items-start gap-3">
            <span className="mt-1 rounded-full bg-accent-4 p-3 text-accent-2">
              <Sparkles size={18} />
            </span>
            <div>
              <p className="mini-label">Closest matches</p>
              <h2 className="mt-3 text-3xl text-foreground">
                No perfect match yet, but these looks are closest to your style brief.
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
            {sortedRecommendations.length} creator-ready{" "}
            {sortedRecommendations.length === 1 ? "look" : "looks"} ranked for your brief.
          </h2>
          <p className="mt-3 max-w-2xl">
            The engine is balancing fit, occasion, colors, stores, and spend range using the current mock catalog.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="pill">{sortOptions.find((option) => option.value === sort)?.label}</span>
          {filters.maxBudget ? <span className="pill">{formatOptionLabel(filters.maxBudget)}</span> : null}
        </div>
      </div>

      {sortedRecommendations.length === 0 ? (
        <div className="glass-panel p-6 sm:p-8">
          <p className="mini-label">No looks in current filter mix</p>
          <h2 className="mt-3 text-4xl text-foreground">Try widening one filter to bring more looks back.</h2>
          <p className="mt-4 max-w-2xl">
            The recommendation engine still has mock inventory, but the current combination of store, color, fit, and budget is too narrow.
          </p>
          <div className="mt-6">
            <button type="button" onClick={resetFiltersToBrief} className="cta-primary">
              Reset to brief
            </button>
          </div>
        </div>
      ) : (
        <div className="grid gap-6 xl:grid-cols-2">
          {sortedRecommendations.map((recommendation) => (
            <RecommendationCard
              key={recommendation.id}
              recommendation={recommendation}
              saved={savedLookIds.includes(recommendation.id)}
              onToggleSave={toggleSave}
            />
          ))}
        </div>
      )}
    </section>
  );
}
