"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Bookmark, FunnelX, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
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
  readStoredQuizAnswers,
  writeSavedLookIds,
} from "@/lib/local-storage";
import { formatCurrency, formatOptionLabel } from "@/lib/utils";
import { buildOutfitRecommendations, budgetLabelFromCap, hasQuizAnswers } from "@/utils/outfitMatcher";
import type { QuizAnswers } from "@/types";

type ResultFilters = {
  aesthetic: string;
  occasion: string;
  budgetRange: string;
  fitPreference: string;
  store: string;
};

const allStores = Array.from(new Set(products.map((product) => product.store))).sort();

function mergeAnswers(primary: QuizAnswers, secondary?: QuizAnswers | null) {
  if (!secondary) {
    return primary;
  }

  return {
    ...secondary,
    ...Object.fromEntries(
      Object.entries(primary).filter(([, value]) => Boolean(value)),
    ),
  } as QuizAnswers;
}

export function ResultsView() {
  const searchParams = useSearchParams();
  const searchParamsObject = Object.fromEntries(searchParams.entries()) as Partial<
    Record<keyof QuizAnswers, string>
  >;

  return <ResultsContent key={searchParams.toString()} searchParamsObject={searchParamsObject} />;
}

function ResultsContent({
  searchParamsObject,
}: {
  searchParamsObject: Partial<Record<keyof QuizAnswers, string>>;
}) {
  const router = useRouter();
  const [isHydrated, setIsHydrated] = useState(false);
  const [storedAnswers, setStoredAnswers] = useState<QuizAnswers | null>(null);
  const [savedIds, setSavedIds] = useState<string[]>([]);

  useEffect(() => {
    setStoredAnswers(readStoredQuizAnswers());
    setSavedIds(readSavedLookIds());
    setIsHydrated(true);
  }, []);

  const paramAnswers = normalizeQuizAnswers(searchParamsObject);
  const mergedAnswers = mergeAnswers(paramAnswers, storedAnswers);
  const quizAnswers = isHydrated && hasQuizAnswers(mergedAnswers) ? mergedAnswers : null;
  const [filters, setFilters] = useState<ResultFilters>(() => ({
    aesthetic: quizAnswers?.aesthetic || "all",
    occasion: quizAnswers?.occasion || "all",
    budgetRange: quizAnswers?.budgetRange || "",
    fitPreference: quizAnswers?.fitPreference || "all",
    store: "all",
  }));

  function updateFilter<K extends keyof ResultFilters>(key: K, value: ResultFilters[K]) {
    setFilters((current) => ({ ...current, [key]: value }));
  }

  function toggleSave(id: string) {
    setSavedIds((current) => {
      const next = current.includes(id)
        ? current.filter((entry) => entry !== id)
        : [...current, id];

      writeSavedLookIds(next);
      return next;
    });
  }

  function startNewQuiz() {
    clearStoredQuizAnswers();
    router.push("/quiz");
  }

  if (!isHydrated) {
    return (
      <div className="shell section-space">
        <div className="glass-panel p-8 sm:p-10">
          <p className="eyebrow">Loading results</p>
          <h1 className="text-4xl text-foreground sm:text-5xl">
            Preparing your creator-ready outfit pack.
          </h1>
          <p className="mt-4 max-w-2xl">
            FitMuse is reading your saved style brief and building the first round of looks.
          </p>
        </div>
      </div>
    );
  }

  if (!quizAnswers) {
    return (
      <div className="shell section-space">
        <div className="glass-panel p-8 sm:p-10">
          <p className="eyebrow">Take the quiz first</p>
          <h1 className="text-4xl text-foreground sm:text-5xl">
            Take the Style Quiz first so FitMuse can build looks around you.
          </h1>
          <p className="mt-4 max-w-2xl">
            Your measurements, aesthetic, occasion, budget, and fit preference are what make the
            results feel personalized.
          </p>
          <Link href="/quiz" className="cta-primary mt-6">
            Take Style Quiz
          </Link>
        </div>
      </div>
    );
  }

  const currentAnswers = quizAnswers;

  const activeAnswers: QuizAnswers = {
    ...currentAnswers,
    aesthetic:
      filters.aesthetic === "all"
        ? currentAnswers.aesthetic
        : (filters.aesthetic as QuizAnswers["aesthetic"]),
    occasion:
      filters.occasion === "all"
        ? currentAnswers.occasion
        : (filters.occasion as QuizAnswers["occasion"]),
    budgetRange: (filters.budgetRange || currentAnswers.budgetRange) as QuizAnswers["budgetRange"],
    fitPreference:
      filters.fitPreference === "all"
        ? currentAnswers.fitPreference
        : (filters.fitPreference as QuizAnswers["fitPreference"]),
    storesLike: filters.store === "all" ? currentAnswers.storesLike : filters.store,
  };

  const generatedRecommendations = buildOutfitRecommendations(activeAnswers, 8);
  const recommendations =
    filters.store === "all"
      ? generatedRecommendations
      : generatedRecommendations.filter((item) => item.stores.includes(filters.store));
  const savedRecommendations = recommendations.filter((item) => savedIds.includes(item.id));
  const leadLook = recommendations[0];
  const usingFallback =
    recommendations.length > 0 && recommendations.every((item) => item.matchMode === "closest");

  function resetFilters() {
    setFilters({
      aesthetic: currentAnswers.aesthetic || "all",
      occasion: currentAnswers.occasion || "all",
      budgetRange: currentAnswers.budgetRange || "",
      fitPreference: currentAnswers.fitPreference || "all",
      store: "all",
    });
  }

  return (
    <div className="shell section-space">
      <section className="grid gap-8 xl:grid-cols-[1fr_0.95fr] xl:items-start">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="space-y-6"
        >
          <div className="flex flex-wrap gap-2">
            <span className="pill">
              Styled for: {formatOptionLabel(activeAnswers.aesthetic || "smart casual")}
            </span>
            <span className="pill">{formatOptionLabel(activeAnswers.occasion || "daily wear")}</span>
            <span className="pill">{budgetLabelFromCap(activeAnswers.budgetRange)}</span>
            <span className="pill">{formatOptionLabel(activeAnswers.fitPreference || "regular")}</span>
          </div>

          <div>
            <p className="eyebrow">Looks</p>
            <h1 className="max-w-4xl text-5xl leading-[0.96] text-foreground sm:text-6xl">
              {currentAnswers.name
                ? `${currentAnswers.name}, your FitMuse looks are ready.`
                : "Your FitMuse looks are ready."}
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8">
              Personalized outfit packs built around your brief, with mock shopping links and fit notes.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { label: "Looks generated", value: String(recommendations.length).padStart(2, "0") },
              {
                label: "Top look price",
                value: leadLook ? formatCurrency(leadLook.totalPrice) : "--",
              },
              { label: "Saved looks", value: String(savedRecommendations.length).padStart(2, "0") },
            ].map((item) => (
              <div key={item.label} className="metric-card">
                <p className="mini-label">{item.label}</p>
                <p className="mt-3 text-2xl text-foreground">{item.value}</p>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
          className="hero-card overflow-hidden p-4 sm:p-5"
        >
          <div className="rounded-[1.9rem] bg-gradient-to-br from-[#203138] via-[#6d8378] to-[#e9d7c0] p-5 text-white">
            <div className="flex items-center justify-between gap-4">
              <span className="rounded-full bg-white/14 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-white/90">
                Style brief
              </span>
              <span className="rounded-full bg-white/14 p-2 text-white">
                <Sparkles size={16} />
              </span>
            </div>

            <h2 className="mt-5 text-4xl leading-tight text-white">
              {leadLook ? leadLook.name : "No matching looks yet"}
            </h2>
            <p className="mt-4 max-w-xl text-sm leading-6 text-white/80">
              {leadLook
                ? leadLook.creatorUseCase
                : "Adjust the filters or return to the quiz to widen your brief."}
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {[
                { label: "Aesthetic", value: formatOptionLabel(activeAnswers.aesthetic || "smart casual") },
                { label: "Occasion", value: formatOptionLabel(activeAnswers.occasion || "daily wear") },
                { label: "Budget", value: budgetLabelFromCap(activeAnswers.budgetRange) },
                { label: "Fit", value: formatOptionLabel(activeAnswers.fitPreference || "regular") },
              ].map((item) => (
                <div key={item.label} className="rounded-[1.3rem] bg-white/12 px-4 py-4 backdrop-blur-sm">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/70">
                    {item.label}
                  </p>
                  <p className="mt-2 text-sm text-white">{item.value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-3">
            <Link href="/quiz" className="cta-primary">
              Edit quiz
            </Link>
            <button type="button" className="cta-secondary" onClick={resetFilters}>
              Reset filters
            </button>
            <button type="button" className="cta-secondary" onClick={startNewQuiz}>
              Start New Quiz
            </button>
          </div>
        </motion.div>
      </section>

      <section className="mt-10">
        <div className="hero-card p-4 sm:p-5">
          <div className="grid gap-4 xl:grid-cols-[repeat(5,minmax(0,1fr))_auto]">
            <label className="grid gap-2">
              <span className="mini-label">Aesthetic</span>
              <select
                value={filters.aesthetic}
                onChange={(event) => updateFilter("aesthetic", event.target.value)}
                className="filter-select"
              >
                <option value="all">All aesthetics</option>
                {aestheticOptions.map((option) => (
                  <option key={option} value={option}>
                    {formatOptionLabel(option)}
                  </option>
                ))}
              </select>
            </label>

            <label className="grid gap-2">
              <span className="mini-label">Occasion</span>
              <select
                value={filters.occasion}
                onChange={(event) => updateFilter("occasion", event.target.value)}
                className="filter-select"
              >
                <option value="all">All occasions</option>
                {occasionOptions.map((option) => (
                  <option key={option} value={option}>
                    {formatOptionLabel(option)}
                  </option>
                ))}
              </select>
            </label>

            <label className="grid gap-2">
              <span className="mini-label">Max budget</span>
              <select
                value={filters.budgetRange}
                onChange={(event) => updateFilter("budgetRange", event.target.value)}
                className="filter-select"
              >
                <option value="">All budgets</option>
                {budgetRangeOptions.map((option) => (
                  <option key={option} value={option}>
                    {formatOptionLabel(option)}
                  </option>
                ))}
              </select>
            </label>

            <label className="grid gap-2">
              <span className="mini-label">Fit preference</span>
              <select
                value={filters.fitPreference}
                onChange={(event) => updateFilter("fitPreference", event.target.value)}
                className="filter-select"
              >
                <option value="all">All fits</option>
                {fitPreferenceOptions.map((option) => (
                  <option key={option} value={option}>
                    {formatOptionLabel(option)}
                  </option>
                ))}
              </select>
            </label>

            <label className="grid gap-2">
              <span className="mini-label">Store</span>
              <select
                value={filters.store}
                onChange={(event) => updateFilter("store", event.target.value)}
                className="filter-select"
              >
                <option value="all">All stores</option>
                {allStores.map((store) => (
                  <option key={store} value={store}>
                    {store}
                  </option>
                ))}
              </select>
            </label>

            <button type="button" onClick={resetFilters} className="cta-secondary self-end">
              <span className="flex items-center gap-2">
                <FunnelX size={15} />
                Reset
              </span>
            </button>
          </div>
        </div>
      </section>

      {savedRecommendations.length > 0 ? (
        <section className="mt-10">
          <div className="soft-card">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="eyebrow">Saved looks</p>
                <h2 className="text-3xl text-foreground">Your local favorites</h2>
              </div>
              <span className="rounded-full bg-background/88 px-4 py-2 text-sm font-semibold text-foreground">
                {savedRecommendations.length} saved
              </span>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {savedRecommendations.map((recommendation) => (
                <div
                  key={recommendation.id}
                  className="rounded-[1.6rem] border border-line/70 bg-white/80 p-5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="mini-label">{formatOptionLabel(recommendation.aesthetic)}</p>
                      <h3 className="mt-2 text-2xl text-foreground">{recommendation.name}</h3>
                    </div>
                    <span className="rounded-full bg-background/90 px-3 py-2 text-sm font-semibold text-foreground">
                      {formatCurrency(recommendation.totalPrice)}
                    </span>
                  </div>
                  <p className="mt-3 text-sm">{recommendation.creatorUseCase}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {recommendation.colorPalette.slice(0, 3).map((color) => (
                      <span key={color} className="chip">
                        {formatOptionLabel(color)}
                      </span>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleSave(recommendation.id)}
                    className="cta-secondary mt-5"
                  >
                    Remove saved
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {usingFallback ? (
        <section className="mt-10">
          <div className="soft-card">
            <p className="eyebrow">Closest matches</p>
            <h2 className="text-3xl text-foreground">
              No perfect match yet, but here are the closest looks.
            </h2>
            <p className="mt-4 max-w-3xl">
              The current mock catalog does not have an exact combination for every brief yet, so
              FitMuse is showing the strongest fallback outfits based on your colors, fit, budget,
              and occasion.
            </p>
          </div>
        </section>
      ) : null}

      {recommendations.length > 0 ? (
        <section className="mt-10">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <p className="eyebrow">Recommendations</p>
              <h2 className="text-4xl text-foreground">Outfit recommendations for your brief</h2>
            </div>
            <p className="text-sm text-muted">{recommendations.length} looks available</p>
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            {recommendations.map((recommendation) => (
              <RecommendationCard
                key={recommendation.id}
                recommendation={recommendation}
                saved={savedIds.includes(recommendation.id)}
                onToggleSave={toggleSave}
              />
            ))}
          </div>
        </section>
      ) : (
        <section className="mt-10">
          <div className="soft-card">
            <div className="flex items-center gap-3">
              <span className="rounded-full bg-accent-4 p-3 text-accent-2">
                <Bookmark size={18} />
              </span>
              <div>
                <p className="mini-label">No looks yet</p>
                <h2 className="mt-2 text-3xl text-foreground">
                  There are no looks for those filters right now.
                </h2>
              </div>
            </div>
            <p className="mt-5 max-w-2xl">
              Try widening the store, budget, or fit filters, or return to the quiz and loosen the
              brief slightly.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <button type="button" className="cta-primary" onClick={resetFilters}>
                Reset filters
              </button>
              <Link href="/quiz" className="cta-secondary">
                Update quiz
              </Link>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
