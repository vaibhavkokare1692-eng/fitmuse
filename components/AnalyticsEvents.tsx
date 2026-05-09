"use client";

import Link from "next/link";
import { useEffect, useMemo, type ComponentProps } from "react";
import {
  trackFitMuseEvent,
  type FitMuseAnalyticsEventName,
  type FitMuseAnalyticsProperties,
} from "@/lib/analytics";

type TrackedLinkProps = ComponentProps<typeof Link> & {
  analyticsEvent: FitMuseAnalyticsEventName;
  analyticsProperties?: FitMuseAnalyticsProperties;
};

type TrackEventOnMountProps = {
  eventName: FitMuseAnalyticsEventName;
  properties?: FitMuseAnalyticsProperties;
};

export function TrackedLink({
  analyticsEvent,
  analyticsProperties,
  onClick,
  ...props
}: TrackedLinkProps) {
  return (
    <Link
      {...props}
      onClick={(event) => {
        trackFitMuseEvent(analyticsEvent, analyticsProperties);
        onClick?.(event);
      }}
    />
  );
}

export function TrackEventOnMount({ eventName, properties = {} }: TrackEventOnMountProps) {
  const stableProperties = useMemo(() => properties, [properties]);

  useEffect(() => {
    trackFitMuseEvent(eventName, stableProperties);
  }, [eventName, stableProperties]);

  return null;
}
