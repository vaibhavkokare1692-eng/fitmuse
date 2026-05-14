import type { Metadata } from "next";
import Link from "next/link";
import { OutfitVisual } from "@/components/OutfitVisual";
import { outfits } from "@/data/mock-data";
import {
  getRealPackBudgetSummary,
  getRealProductsForOutfitPack,
  getShopReadyRealOutfitPacks,
} from "@/data/realOutfitPacks";
import { formatAestheticLabel, formatCurrency, formatOptionLabel } from "@/lib/utils";
import type { Outfit, RealOutfitPack, RealProduct } from "@/types";

export const metadata: Metadata = {
  title: "Sample Looks",
  description:
    "Browse sample outfit boards and manually curated retailer-candidate examples before taking the FitMuse style quiz.",
};

type VisualItem = {
  category: "top" | "bottom" | "shoes" | "accessory" | "outerwear";
  name: string;
};

type RealBoardExample = RealOutfitPack & {
  products: RealProduct[];
  stores: string[];
  budgetSummary: string;
};

function getMockVisualItems(outfit: Outfit): VisualItem[] {
  return [
    { category: "top", name: outfit.items.top },
    { category: "bottom", name: outfit.items.bottom },
    { category: "shoes", name: outfit.items.shoes },
    { category: "accessory", name: outfit.items.accessories },
    outfit.items.outerwear ? { category: "outerwear", name: outfit.items.outerwear } : null,
  ].filter(Boolean) as VisualItem[];
}

function getRealVisualCategory(category: RealProduct["category"]): VisualItem["category"] {
  if (category === "outer layer") {
    return "outerwear";
  }

  if (category === "bottom" || category === "shoes" || category === "top") {
    return category;
  }

  return "accessory";
}

function getRealVisualItems(products: RealProduct[]): VisualItem[] {
  return products.map((product) => ({
    category: getRealVisualCategory(product.category),
    name: product.name,
  }));
}

function getRealVisualPalette(products: RealProduct[]) {
  const palette = products
    .flatMap((product) => product.colors)
    .map((color) => color.toLowerCase())
    .filter(Boolean);

  return Array.from(new Set(palette)).slice(0, 4);
}

function getRealBoardExamples(): RealBoardExample[] {
  return getShopReadyRealOutfitPacks()
    .map((pack) => {
      const products = getRealProductsForOutfitPack(pack.productIds);

      return {
        ...pack,
        products,
        stores: Array.from(new Set(products.map((product) => product.store))),
        budgetSummary: getRealPackBudgetSummary(pack.totalPrice, pack.budgetRange),
      };
    })
    .filter((pack) => pack.products.length > 0);
}

function SampleBoardCard({ outfit }: { outfit: Outfit }) {
  return (
    <article className="hero-card flex h-full flex-col p-4 sm:p-5">
      <div className="flex flex-wrap gap-2">
        <span className="chip">Example board</span>
        <span className="chip">{outfit.aesthetic}</span>
        <span className="chip">{outfit.occasion}</span>
      </div>

      <OutfitVisual
        title={outfit.name}
        subtitle="Style example, not personalized results"
        palette={outfit.colors}
        items={getMockVisualItems(outfit)}
        stores={outfit.stores}
        compact
        className="mt-4"
      />

      <div className="flex flex-1 flex-col pt-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="mini-label">{outfit.occasion}</p>
            <h3 className="mt-2 text-2xl text-foreground">{outfit.name}</h3>
          </div>
          <span className="rounded-full border border-line/70 bg-background/82 px-4 py-2 text-sm font-semibold text-foreground">
            {formatCurrency(outfit.estimatedPrice)}
          </span>
        </div>

        <p className="mt-4 text-sm leading-6 text-muted">{outfit.creatorUseCase}</p>

        <div className="mt-4 rounded-[1.35rem] border border-line/70 bg-white/72 p-4">
          <p className="mini-label">Matched because</p>
          <p className="mt-2 text-sm leading-6 text-foreground">{outfit.whyItSuits}</p>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {outfit.stores.slice(0, 3).map((store) => (
            <span key={`${outfit.id}-${store}`} className="pill">
              {store}
            </span>
          ))}
        </div>
      </div>
    </article>
  );
}

function RealBoardCard({ board }: { board: RealBoardExample }) {
  const palette = getRealVisualPalette(board.products);

  return (
    <article className="hero-card flex h-full flex-col p-4 sm:p-5">
      <div className="flex flex-wrap gap-2">
        <span className="chip">Retailer candidate</span>
        <span className="chip">
          {formatAestheticLabel(board.aesthetic, board.targetStylePreference)}
        </span>
        <span className="chip">{formatOptionLabel(board.occasion)}</span>
        <span className="chip">{board.budgetSummary}</span>
      </div>

      <OutfitVisual
        title={board.name}
        subtitle="Style preview, not exact product photos"
        palette={palette.length > 0 ? palette : ["cream", "stone", "charcoal", "taupe"]}
        items={getRealVisualItems(board.products)}
        stores={board.stores}
        compact
        className="mt-4"
      />

      <div className="flex flex-1 flex-col pt-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="mini-label">{formatOptionLabel(board.budgetRange)}</p>
            <h3 className="mt-2 text-2xl text-foreground">{board.name}</h3>
          </div>
          <span className="rounded-full border border-line/70 bg-background/82 px-4 py-2 text-sm font-semibold text-foreground">
            {formatCurrency(board.totalPrice)}
          </span>
        </div>

        <div className="trust-panel mt-4">
          <p className="mini-label">Trust note</p>
          <p className="mt-2 text-sm leading-6 text-foreground">
            Manually curated retailer candidates. Verify price and availability before purchase.
          </p>
        </div>

        <div className="mt-4 rounded-[1.35rem] border border-line/70 bg-white/72 p-4">
          <p className="mini-label">Matched because</p>
          <p className="mt-2 text-sm leading-6 text-foreground">{board.whyItWorks}</p>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {board.stores.map((store) => (
            <span key={`${board.id}-${store}`} className="pill">
              {store}
            </span>
          ))}
        </div>
      </div>
    </article>
  );
}

export default function SampleLooksPage() {
  const sampleBoards = outfits;
  const realBoards = getRealBoardExamples();

  return (
    <>
      <section className="section-space pb-8 pt-4 sm:pb-14 sm:pt-8">
        <div className="shell">
          <div className="dark-panel overflow-hidden p-6 sm:p-10">
            <div className="max-w-4xl">
              <p className="eyebrow !mb-0 text-accent-3">Public examples</p>
              <h1 className="mt-4 text-5xl leading-[0.95] text-white sm:text-6xl lg:text-7xl">
                Sample outfit boards
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-white/76 sm:text-lg sm:leading-8">
                Browse examples of how FitMuse turns a style brief into complete boards. These are
                public samples, not personalized quiz results.
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Link href="/quiz" className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-foreground hover:bg-accent-3">
                  Take the quiz for your brief
                </Link>
                <Link
                  href="#retailer-candidates"
                  className="inline-flex items-center justify-center px-1 py-2 text-sm font-semibold text-white/76 underline-offset-4 hover:text-white hover:underline"
                >
                  See retailer candidate examples
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-space pt-0">
        <div className="shell">
          <div className="mb-6 flex flex-col gap-4 sm:mb-10 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="eyebrow">Style board examples</p>
              <h2 className="section-title text-foreground">Example boards before you take the quiz.</h2>
              <p className="mt-4 max-w-2xl text-sm leading-6 text-muted sm:text-base sm:leading-7">
                These show the shape of a FitMuse board: outfit direction, store mix, budget
                context, and why the look works.
              </p>
            </div>
            <Link href="/quiz" className="cta-secondary">
              Start your style brief
            </Link>
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {sampleBoards.map((outfit) => (
              <SampleBoardCard key={outfit.id} outfit={outfit} />
            ))}
          </div>
        </div>
      </section>

      <section id="retailer-candidates" className="section-space pt-0">
        <div className="shell">
          <div className="mb-6 flex flex-col gap-4 sm:mb-10 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="eyebrow">Retailer candidate examples</p>
              <h2 className="section-title text-foreground">
                Manually curated boards with retailer candidates.
              </h2>
              <p className="mt-4 max-w-2xl text-sm leading-6 text-muted sm:text-base sm:leading-7">
                These examples use manually curated retailer candidates. Prices and availability
                must be verified on the retailer site before purchase.
              </p>
            </div>
            <span className="pill">{realBoards.length} candidate boards</span>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            {realBoards.map((board) => (
              <RealBoardCard key={board.id} board={board} />
            ))}
          </div>
        </div>
      </section>

      <section className="pb-12 sm:pb-20">
        <div className="shell">
          <div className="hero-card flex flex-col gap-5 p-6 sm:p-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <p className="eyebrow">Your brief next</p>
              <h2 className="mt-3 text-3xl text-foreground sm:text-4xl">
                Want boards matched to your occasion, budget, stores, and fit?
              </h2>
              <p className="mt-3 text-sm leading-6 text-muted">
                Take the quiz when you are ready for personalized results instead of public
                examples.
              </p>
            </div>
            <Link href="/quiz" className="cta-primary">
              Take the quiz for your brief
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
