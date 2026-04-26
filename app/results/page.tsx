import type { Metadata } from "next";
import { Suspense } from "react";
import { ResultsView } from "@/components/ResultsView";

export const metadata: Metadata = {
  title: "Looks",
};

function ResultsFallback() {
  return (
    <div className="shell section-space">
      <div className="glass-panel p-8 sm:p-10">
        <p className="eyebrow">Loading results</p>
        <h1 className="text-4xl text-foreground sm:text-5xl">
          Preparing your creator-ready outfits.
        </h1>
        <p className="mt-4 max-w-2xl">
          We are reading your style quiz answers from localStorage and the URL so this page stays
          easy to share and deploy as a static site.
        </p>
      </div>
    </div>
  );
}

export default function ResultsPage() {
  return (
    <Suspense fallback={<ResultsFallback />}>
      <ResultsView />
    </Suspense>
  );
}
