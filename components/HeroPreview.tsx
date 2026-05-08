import { Bookmark, SlidersHorizontal, Sparkles } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { ShoppingLinksButton } from "@/components/ShoppingLinksButton";
import type { Outfit } from "@/types";

type HeroPreviewProps = {
  outfit: Outfit;
};

export function HeroPreview({ outfit }: HeroPreviewProps) {
  const quickItems = [outfit.items.top, outfit.items.bottom, outfit.items.shoes].slice(0, 3);

  return (
    <div className="relative mx-auto w-full max-w-[34rem]">
      <div className="absolute -left-10 top-12 h-36 w-36 rounded-full bg-accent/14 blur-3xl" />
      <div className="absolute -right-8 top-8 h-28 w-28 rounded-full bg-accent-2/12 blur-3xl" />
      <div className="absolute -bottom-10 right-4 h-32 w-32 rounded-full bg-accent-3/30 blur-3xl" />

      <div className="relative rounded-[2.8rem] border border-white/70 bg-white/68 p-3 shadow-[0_28px_120px_rgba(27,21,19,0.12)] backdrop-blur-xl sm:p-4">
        <div className="grid gap-4 sm:grid-cols-[0.72fr_0.28fr]">
          <div className="rounded-[2.1rem] border border-white/70 bg-white/88 p-3 shadow-[0_18px_40px_rgba(27,21,19,0.07)]">
            <div className="rounded-[1.7rem] bg-foreground px-4 py-3 text-white">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/60">
                    FitMuse app
                  </p>
                  <p className="mt-1 text-sm text-white/82">Personalized recommendation</p>
                </div>
                <span className="rounded-full bg-white/10 p-2 text-white">
                  <Sparkles size={16} />
                </span>
              </div>
            </div>

            <div className="gradient-visual mt-3 h-48 p-5 text-white sm:h-56">
              <div className="flex h-full items-end justify-between">
                <div className="rounded-[1.5rem] bg-white/12 px-4 py-3 backdrop-blur-md">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/70">
                    Occasion
                  </p>
                  <p className="mt-2 text-sm text-white/92">{outfit.occasion}</p>
                </div>
                <div className="rounded-[1.5rem] bg-black/12 px-4 py-3 text-right backdrop-blur-md">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/70">
                    Budget
                  </p>
                  <p className="mt-2 text-sm text-white/92">{formatCurrency(outfit.estimatedPrice)}</p>
                </div>
              </div>
            </div>

            <div className="space-y-5 p-3 pb-2 pt-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="mini-label">Outfit</p>
                  <h3 className="mt-2 text-3xl text-foreground">{outfit.name}</h3>
                </div>
                <button
                  type="button"
                  className="rounded-full border border-line/70 bg-background/90 px-4 py-2 text-sm font-semibold text-foreground"
                >
                  <span className="flex items-center gap-2">
                    <Bookmark size={14} />
                    Save preview
                  </span>
                </button>
              </div>

              <div className="rounded-[1.4rem] bg-white/76 p-4">
                <p className="mini-label">Fit note</p>
                <p className="mt-2 text-sm leading-6 text-foreground">
                  Polished lines, easy layering, and a camera-friendly palette built around your brief.
                </p>
              </div>

              <div>
                <p className="mini-label">Included</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {quickItems.map((item) => (
                    <span key={item} className="chip">
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              <div className="rounded-[1.4rem] border border-line/70 bg-background/72 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="mini-label">Preview action</p>
                    <p className="mt-2 text-sm leading-6 text-foreground">
                      Explore the sample flow now, then save your real shortlist after the quiz.
                    </p>
                  </div>
                  <ShoppingLinksButton />
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="rounded-[1.8rem] border border-white/70 bg-white/82 p-4 shadow-[0_16px_30px_rgba(27,21,19,0.06)]">
              <div className="flex items-center gap-3">
                <span className="rounded-full bg-accent-4 p-2 text-accent-2">
                  <SlidersHorizontal size={16} />
                </span>
                <p className="text-sm font-medium text-foreground">Quick filters</p>
              </div>
              <div className="mt-4 grid gap-2">
                {["Date night", "Slim fit", "$150-$250"].map((item) => (
                  <div
                    key={item}
                    className="rounded-full border border-line/70 bg-background/88 px-3 py-2 text-xs text-foreground"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[1.8rem] border border-white/70 bg-white/82 p-4 shadow-[0_16px_30px_rgba(27,21,19,0.06)]">
              <p className="mini-label">Saved looks</p>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="h-20 rounded-[1.1rem] bg-foreground/6" />
                <div className="h-20 rounded-[1.1rem] bg-accent-3/35" />
                <div className="h-20 rounded-[1.1rem] bg-foreground/6" />
                <div className="h-20 rounded-[1.1rem] bg-foreground/6" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
