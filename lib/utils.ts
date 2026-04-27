import type { Occasion, StylePreference } from "@/types";

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export function splitCommaSeparated(value?: string) {
  return (value ?? "")
    .split(",")
    .map((entry) => entry.trim().toLowerCase())
    .filter(Boolean);
}

export function formatOptionLabel(value?: string) {
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

function normalize(value?: string | null) {
  return value?.trim().toLowerCase() ?? "";
}

export function formatAestheticLabel(
  aesthetic?: string,
  stylePreference?: StylePreference | "" | string,
) {
  const normalizedAesthetic = normalize(aesthetic);
  const normalizedPreference = normalize(stylePreference);

  if (normalizedAesthetic === "clean girl") {
    return normalizedPreference === "feminine" ? "Clean Girl" : "Clean Minimal";
  }

  return formatOptionLabel(aesthetic);
}

export function getOccasionResultsDescriptor(occasion?: Occasion | "" | string) {
  const normalized = normalize(occasion);

  if (normalized === "date") {
    return "date-ready";
  }

  if (normalized === "office") {
    return "office-ready";
  }

  if (normalized === "travel") {
    return "travel-ready";
  }

  if (normalized === "party") {
    return "party-ready";
  }

  if (normalized === "college") {
    return "college-ready";
  }

  if (normalized === "daily wear") {
    return "everyday";
  }

  if (normalized === "wedding guest") {
    return "wedding guest";
  }

  return "creator-ready";
}

export function getUseCaseLabel(occasion?: Occasion | "" | string) {
  const normalized = normalize(occasion);

  if (normalized === "office") {
    return "Work setting";
  }

  if (normalized === "travel") {
    return "Travel use";
  }

  if (normalized === "reels" || normalized === "photoshoot" || normalized === "brand content") {
    return "Creator use case";
  }

  return "Best for";
}

export function isCreatorOccasion(occasion?: Occasion | "" | string) {
  const normalized = normalize(occasion);

  return (
    normalized === "reels" || normalized === "photoshoot" || normalized === "brand content"
  );
}
