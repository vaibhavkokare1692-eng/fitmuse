"use client";

import { track } from "@vercel/analytics";

export type FitMuseAnalyticsEventName =
  | "homepage_cta_clicked"
  | "quiz_started"
  | "quiz_step_completed"
  | "quiz_submitted"
  | "results_viewed"
  | "real_candidate_board_opened"
  | "saved_look_clicked"
  | "retailer_candidate_clicked"
  | "pricing_page_viewed";

export type FitMuseAnalyticsPropertyKey =
  | "source"
  | "destination"
  | "stepIndex"
  | "stepTitle"
  | "stylePreference"
  | "aesthetic"
  | "occasion"
  | "budgetRange"
  | "fitPreference"
  | "resultCount"
  | "realCandidateBoardCount"
  | "mode"
  | "boardId"
  | "boardName"
  | "verificationStatus"
  | "action"
  | "productId"
  | "store"
  | "category";

type AnalyticsValue = string | number | boolean;

export type FitMuseAnalyticsProperties = Partial<
  Record<FitMuseAnalyticsPropertyKey, AnalyticsValue | null | undefined>
>;

const approvedEvents = new Set<FitMuseAnalyticsEventName>([
  "homepage_cta_clicked",
  "quiz_started",
  "quiz_step_completed",
  "quiz_submitted",
  "results_viewed",
  "real_candidate_board_opened",
  "saved_look_clicked",
  "retailer_candidate_clicked",
  "pricing_page_viewed",
]);

const approvedPropertyKeys = new Set<FitMuseAnalyticsPropertyKey>([
  "source",
  "destination",
  "stepIndex",
  "stepTitle",
  "stylePreference",
  "aesthetic",
  "occasion",
  "budgetRange",
  "fitPreference",
  "resultCount",
  "realCandidateBoardCount",
  "mode",
  "boardId",
  "boardName",
  "verificationStatus",
  "action",
  "productId",
  "store",
  "category",
]);

function sanitizeAnalyticsValue(value: AnalyticsValue | null | undefined) {
  if (value === null || value === undefined) {
    return undefined;
  }

  if (typeof value === "number") {
    return Number.isFinite(value) ? value : undefined;
  }

  if (typeof value === "boolean") {
    return value;
  }

  const trimmed = value.trim();

  if (!trimmed) {
    return undefined;
  }

  return trimmed.slice(0, 96);
}

export function trackFitMuseEvent(
  eventName: FitMuseAnalyticsEventName,
  properties: FitMuseAnalyticsProperties = {},
) {
  if (typeof window === "undefined" || !approvedEvents.has(eventName)) {
    return;
  }

  const sanitizedProperties: Record<string, AnalyticsValue> = {};

  Object.entries(properties).forEach(([key, value]) => {
    const propertyKey = key as FitMuseAnalyticsPropertyKey;

    if (!approvedPropertyKeys.has(propertyKey)) {
      return;
    }

    const sanitizedValue = sanitizeAnalyticsValue(value);

    if (sanitizedValue !== undefined) {
      sanitizedProperties[propertyKey] = sanitizedValue;
    }
  });

  track(eventName, sanitizedProperties);
}
