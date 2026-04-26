import { emptyQuizAnswers, hasQuizAnswers } from "@/utils/outfitMatcher";
import type {
  Aesthetic,
  BudgetRange,
  FitPreference,
  Occasion,
  QuizAnswers,
  StylePreference,
} from "@/types";

export const QUIZ_STORAGE_KEY = "fitmuse-quiz-answers";
export const SAVED_LOOKS_STORAGE_KEY = "fitmuse-saved-looks";

function normalize(value?: string | null) {
  return value?.trim().toLowerCase() ?? "";
}

const aestheticMap: Record<string, Aesthetic> = {
  "old money": "old money",
  streetwear: "streetwear",
  minimalist: "minimalist",
  "clean girl": "clean girl",
  "smart casual": "smart casual",
  office: "office",
  party: "party",
  "date night": "date night",
  travel: "travel",
  "creator/photoshoot": "creator/photoshoot",
  "influencer/content shoot": "creator/photoshoot",
  "creator content shoot": "creator/photoshoot",
  "luxury neutral": "luxury neutral",
  "gym casual": "gym casual",
};

const occasionMap: Record<string, Occasion> = {
  reels: "reels",
  photoshoot: "photoshoot",
  date: "date",
  party: "party",
  college: "college",
  office: "office",
  travel: "travel",
  "wedding guest": "wedding guest",
  "daily wear": "daily wear",
  "brand content": "brand content",
};

const budgetRangeMap: Record<string, BudgetRange> = {
  "under $100": "under $100",
  "$100-$200": "$100-$200",
  "$100 - $200": "$100-$200",
  "$200-$350": "$200-$350",
  "$200 - $350": "$200-$350",
  "$350+": "$350+",
  "under $75": "under $100",
  "$75 - $150": "$100-$200",
  "$150 - $250": "$200-$350",
  "$250 - $400": "$350+",
  "$400+": "$350+",
};

const fitPreferenceMap: Record<string, FitPreference> = {
  slim: "slim",
  "slim fit": "slim",
  regular: "regular",
  relaxed: "relaxed",
  oversized: "oversized",
  modest: "modest",
  classy: "classy",
  trendy: "trendy",
};

const stylePreferenceMap: Record<string, StylePreference> = {
  feminine: "feminine",
  masculine: "masculine",
  androgynous: "androgynous",
  "mixed / open to all": "mixed / open to all",
};

function normalizeMappedValue<T extends string>(
  value: string | null | undefined,
  map: Record<string, T>,
): T | "" {
  const normalized = normalize(value);

  return map[normalized] ?? "";
}

export function normalizeQuizAnswers(
  values?: Partial<Record<keyof QuizAnswers | "hip", string | null | undefined>> | null,
) {
  const base = emptyQuizAnswers();

  return {
    ...base,
    name: values?.name?.trim() ?? "",
    stylePreference: normalizeMappedValue(values?.stylePreference, stylePreferenceMap),
    location: values?.location?.trim() ?? "",
    height: values?.height?.trim() ?? "",
    weight: values?.weight?.trim() ?? "",
    chestBust: values?.chestBust?.trim() ?? "",
    waist: values?.waist?.trim() ?? "",
    hips: values?.hips?.trim() ?? values?.hip?.trim() ?? "",
    topSize: values?.topSize?.trim() ?? "",
    bottomSize: values?.bottomSize?.trim() ?? "",
    shoeSize: values?.shoeSize?.trim() ?? "",
    bodyType: values?.bodyType?.trim() ?? "",
    aesthetic: normalizeMappedValue(values?.aesthetic, aestheticMap),
    occasion: normalizeMappedValue(values?.occasion, occasionMap),
    budgetRange: normalizeMappedValue(values?.budgetRange, budgetRangeMap),
    fitPreference: normalizeMappedValue(values?.fitPreference, fitPreferenceMap),
    preferredColors: values?.preferredColors?.trim() ?? "",
    avoidColors: values?.avoidColors?.trim() ?? "",
    storesLike: values?.storesLike?.trim() ?? "",
  } satisfies QuizAnswers;
}

export function buildResultsSearch(answers: QuizAnswers) {
  const params = new URLSearchParams();

  Object.entries(answers).forEach(([key, value]) => {
    if (value) {
      params.set(key, value);
    }
  });

  return params.toString();
}

export function readStoredQuizAnswers() {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(QUIZ_STORAGE_KEY);

    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as Partial<QuizAnswers>;
    const normalized = normalizeQuizAnswers(parsed);

    return hasQuizAnswers(normalized) ? normalized : null;
  } catch {
    return null;
  }
}

export function writeStoredQuizAnswers(answers: QuizAnswers) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(QUIZ_STORAGE_KEY, JSON.stringify(answers));
}

export function clearStoredQuizAnswers() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(QUIZ_STORAGE_KEY);
}

export function readSavedLookIds() {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(SAVED_LOOKS_STORAGE_KEY);

    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw) as unknown;

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter((entry): entry is string => typeof entry === "string");
  } catch {
    return [];
  }
}

export function writeSavedLookIds(ids: string[]) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(SAVED_LOOKS_STORAGE_KEY, JSON.stringify(ids));
}

export function clearSavedLookIds() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(SAVED_LOOKS_STORAGE_KEY);
}
