import { outfits } from "@/data/mock-data";
import { splitCommaSeparated } from "@/lib/utils";
import type { Outfit, UserProfile } from "@/types";

function normalize(value?: string) {
  return value?.trim().toLowerCase() ?? "";
}

function parseBudgetCap(range?: string) {
  if (!range) {
    return null;
  }

  if (range.includes("Under")) {
    return 75;
  }

  if (range.includes("$75")) {
    return 150;
  }

  if (range.includes("$150")) {
    return 250;
  }

  if (range.includes("$250")) {
    return 400;
  }

  return null;
}

function scoreOutfit(outfit: Outfit, profile: UserProfile) {
  let score = 0;
  const requestedAesthetic = normalize(profile.aesthetic);
  const requestedOccasion = normalize(profile.occasion);
  const requestedFit = normalize(profile.fitPreference);
  const preferredColors = splitCommaSeparated(profile.preferredColors);
  const avoidColors = splitCommaSeparated(profile.avoidColors);
  const budgetCap = parseBudgetCap(profile.budgetRange);

  if (requestedAesthetic && normalize(outfit.aesthetic).includes(requestedAesthetic)) {
    score += 4;
  }

  if (requestedOccasion && normalize(outfit.occasion).includes(requestedOccasion)) {
    score += 4;
  }

  if (
    requestedFit &&
    outfit.fitPreferences.some((fitOption) => normalize(fitOption).includes(requestedFit))
  ) {
    score += 2;
  }

  if (preferredColors.length > 0) {
    const preferredMatches = outfit.colors.filter((color) => preferredColors.includes(color)).length;
    score += preferredMatches;
  }

  if (avoidColors.length > 0) {
    const avoidMatches = outfit.colors.filter((color) => avoidColors.includes(color)).length;
    score -= avoidMatches * 2;
  }

  if (budgetCap !== null) {
    if (outfit.estimatedPrice <= budgetCap) {
      score += 3;
    } else if (outfit.estimatedPrice <= budgetCap + 40) {
      score += 1;
    } else {
      score -= 2;
    }
  }

  return score;
}

export function getRankedOutfits(profile: UserProfile) {
  return [...outfits].sort((left, right) => {
    const scoreDelta = scoreOutfit(right, profile) - scoreOutfit(left, profile);

    if (scoreDelta !== 0) {
      return scoreDelta;
    }

    return left.estimatedPrice - right.estimatedPrice;
  });
}

