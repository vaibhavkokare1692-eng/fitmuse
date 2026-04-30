import { emptyQuizAnswers, hasQuizAnswers } from "@/utils/outfitMatcher";
import type {
  Aesthetic,
  BudgetRange,
  FitPreference,
  Occasion,
  OutfitRecommendation,
  QuizAnswers,
  SavedLookSnapshot,
  StylePreference,
} from "@/types";

export const QUIZ_STORAGE_KEY = "fitmuse-quiz-answers";
export const SAVED_LOOKS_STORAGE_KEY = "fitmuse-saved-looks";
export const SAVED_LOOK_DETAILS_STORAGE_KEY = "fitmuse-saved-look-details";
const STORAGE_EVENT_NAME = "fitmuse-storage-change";

let cachedQuizAnswersRaw: null | string | undefined;
let cachedQuizAnswersValue: null | QuizAnswers = null;
let cachedSavedLooksRaw: null | string | undefined;
let cachedSavedLooksValue: SavedLookSnapshot[] = [];

function normalize(value?: string | null) {
  return value?.trim().toLowerCase() ?? "";
}

function dispatchStorageChange(storageKey: string) {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(new CustomEvent(STORAGE_EVENT_NAME, { detail: storageKey }));
}

function subscribeToStorageKey(storageKey: string, onStoreChange: () => void) {
  if (typeof window === "undefined") {
    return () => {};
  }

  const handleStorageChange = (event: Event) => {
    if ("key" in event) {
      const storageEvent = event as StorageEvent;

      if (storageEvent.key && storageEvent.key !== storageKey) {
        return;
      }

      onStoreChange();
      return;
    }

    const customEvent = event as CustomEvent<string>;

    if (customEvent.detail !== storageKey) {
      return;
    }

    onStoreChange();
  };

  window.addEventListener("storage", handleStorageChange);
  window.addEventListener(STORAGE_EVENT_NAME, handleStorageChange as EventListener);

  return () => {
    window.removeEventListener("storage", handleStorageChange);
    window.removeEventListener(STORAGE_EVENT_NAME, handleStorageChange as EventListener);
  };
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

    if (raw === cachedQuizAnswersRaw) {
      return cachedQuizAnswersValue;
    }

    if (!raw) {
      cachedQuizAnswersRaw = null;
      cachedQuizAnswersValue = null;
      return null;
    }

    const parsed = JSON.parse(raw) as Partial<QuizAnswers>;
    const normalized = normalizeQuizAnswers(parsed);
    const nextValue = hasQuizAnswers(normalized) ? normalized : null;
    cachedQuizAnswersRaw = raw;
    cachedQuizAnswersValue = nextValue;

    return nextValue;
  } catch {
    window.localStorage.removeItem(QUIZ_STORAGE_KEY);
    cachedQuizAnswersRaw = null;
    cachedQuizAnswersValue = null;
    return null;
  }
}

export function writeStoredQuizAnswers(answers: QuizAnswers) {
  if (typeof window === "undefined") {
    return;
  }

  const raw = JSON.stringify(answers);
  const normalized = normalizeQuizAnswers(answers);

  window.localStorage.setItem(QUIZ_STORAGE_KEY, raw);
  cachedQuizAnswersRaw = raw;
  cachedQuizAnswersValue = hasQuizAnswers(normalized) ? normalized : null;
  dispatchStorageChange(QUIZ_STORAGE_KEY);
}

export function clearStoredQuizAnswers() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(QUIZ_STORAGE_KEY);
  cachedQuizAnswersRaw = null;
  cachedQuizAnswersValue = null;
  dispatchStorageChange(QUIZ_STORAGE_KEY);
}

export function subscribeStoredQuizAnswers(onStoreChange: () => void) {
  return subscribeToStorageKey(QUIZ_STORAGE_KEY, onStoreChange);
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
      window.localStorage.removeItem(SAVED_LOOKS_STORAGE_KEY);
      return [];
    }

    return parsed.filter((entry): entry is string => typeof entry === "string");
  } catch {
    window.localStorage.removeItem(SAVED_LOOKS_STORAGE_KEY);
    return [];
  }
}

export function writeSavedLookIds(ids: string[]) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(SAVED_LOOKS_STORAGE_KEY, JSON.stringify(ids));
  dispatchStorageChange(SAVED_LOOKS_STORAGE_KEY);
}

export function clearSavedLookIds() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(SAVED_LOOKS_STORAGE_KEY);
  dispatchStorageChange(SAVED_LOOKS_STORAGE_KEY);
}

function normalizeSavedLookSnapshot(entry: unknown): SavedLookSnapshot | null {
  if (!entry || typeof entry !== "object") {
    return null;
  }

  const savedLook = entry as Partial<SavedLookSnapshot & OutfitRecommendation>;

  if (typeof savedLook.id !== "string" || typeof savedLook.name !== "string") {
    return null;
  }

  if (!savedLook.items || !savedLook.colorPalette || !Array.isArray(savedLook.matchReasons)) {
    return null;
  }

  return {
    ...(savedLook as OutfitRecommendation),
    savedAt:
      typeof savedLook.savedAt === "string" && savedLook.savedAt
        ? savedLook.savedAt
        : new Date().toISOString(),
    stylePreference:
      typeof savedLook.stylePreference === "string" ? savedLook.stylePreference : "",
    briefSummary:
      savedLook.briefSummary && typeof savedLook.briefSummary === "object"
        ? {
            name:
              typeof savedLook.briefSummary.name === "string"
                ? savedLook.briefSummary.name
                : "",
            stylePreference:
              typeof savedLook.briefSummary.stylePreference === "string"
                ? savedLook.briefSummary.stylePreference
                : "",
            location:
              typeof savedLook.briefSummary.location === "string"
                ? savedLook.briefSummary.location
                : "",
            aesthetic:
              typeof savedLook.briefSummary.aesthetic === "string"
                ? savedLook.briefSummary.aesthetic
                : "",
            occasion:
              typeof savedLook.briefSummary.occasion === "string"
                ? savedLook.briefSummary.occasion
                : "",
            budgetRange:
              typeof savedLook.briefSummary.budgetRange === "string"
                ? savedLook.briefSummary.budgetRange
                : "",
            fitPreference:
              typeof savedLook.briefSummary.fitPreference === "string"
                ? savedLook.briefSummary.fitPreference
                : "",
            preferredColors: Array.isArray(savedLook.briefSummary.preferredColors)
              ? savedLook.briefSummary.preferredColors.filter(
                  (value): value is string => typeof value === "string",
                )
              : [],
            storesLike: Array.isArray(savedLook.briefSummary.storesLike)
              ? savedLook.briefSummary.storesLike.filter(
                  (value): value is string => typeof value === "string",
                )
              : [],
          }
        : undefined,
  };
}

export function readSavedLooks() {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(SAVED_LOOK_DETAILS_STORAGE_KEY);

    if (raw === cachedSavedLooksRaw) {
      return cachedSavedLooksValue;
    }

    if (!raw) {
      cachedSavedLooksRaw = null;
      cachedSavedLooksValue = [];
      return [];
    }

    const parsed = JSON.parse(raw) as unknown;

    if (!Array.isArray(parsed)) {
      window.localStorage.removeItem(SAVED_LOOK_DETAILS_STORAGE_KEY);
      return [];
    }

    const normalized = parsed
      .map((entry) => normalizeSavedLookSnapshot(entry))
      .filter(Boolean) as SavedLookSnapshot[];

    if (normalized.length !== parsed.length) {
      const normalizedRaw = JSON.stringify(normalized);
      window.localStorage.setItem(SAVED_LOOK_DETAILS_STORAGE_KEY, normalizedRaw);
      cachedSavedLooksRaw = normalizedRaw;
      cachedSavedLooksValue = normalized;
      return normalized;
    }

    cachedSavedLooksRaw = raw;
    cachedSavedLooksValue = normalized;
    return normalized;
  } catch {
    window.localStorage.removeItem(SAVED_LOOK_DETAILS_STORAGE_KEY);
    cachedSavedLooksRaw = null;
    cachedSavedLooksValue = [];
    return [];
  }
}

export function writeSavedLooks(looks: SavedLookSnapshot[]) {
  if (typeof window === "undefined") {
    return;
  }

  const raw = JSON.stringify(looks);

  window.localStorage.setItem(SAVED_LOOK_DETAILS_STORAGE_KEY, raw);
  cachedSavedLooksRaw = raw;
  cachedSavedLooksValue = looks;
  dispatchStorageChange(SAVED_LOOK_DETAILS_STORAGE_KEY);
}

export function subscribeSavedLooks(onStoreChange: () => void) {
  return subscribeToStorageKey(SAVED_LOOK_DETAILS_STORAGE_KEY, onStoreChange);
}
