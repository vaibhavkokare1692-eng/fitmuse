import type { Metadata } from "next";
import { ResultsView } from "@/components/ResultsView";
import type { QuizAnswers } from "@/types";

export const metadata: Metadata = {
  title: "Looks",
};

type ResultsPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function flattenSearchParams(
  params: Record<string, string | string[] | undefined>,
): Partial<Record<keyof QuizAnswers, string>> {
  return Object.fromEntries(
    Object.entries(params).map(([key, value]) => [
      key,
      Array.isArray(value) ? value[0] ?? "" : value ?? "",
    ]),
  ) as Partial<Record<keyof QuizAnswers, string>>;
}

export default async function ResultsPage({ searchParams }: ResultsPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : {};

  return <ResultsView searchParamsObject={flattenSearchParams(resolvedSearchParams)} />;
}
