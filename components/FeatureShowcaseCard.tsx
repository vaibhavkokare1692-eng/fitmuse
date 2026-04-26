import type { LucideIcon } from "lucide-react";

type FeatureVariant = "matching" | "fit" | "occasion" | "budget" | "links" | "saved";

type FeatureShowcaseCardProps = {
  title: string;
  description: string;
  icon: LucideIcon;
  variant: FeatureVariant;
};

function FeaturePreview({ variant }: { variant: FeatureVariant }) {
  if (variant === "matching") {
    return (
      <div className="relative h-36 overflow-hidden rounded-[1.5rem] bg-gradient-to-br from-[#f6f1ea] via-[#fffaf5] to-[#e5ecec] p-4">
        <div className="absolute left-4 top-5 h-20 w-24 rounded-[1.3rem] bg-white/90 shadow-[0_16px_30px_rgba(22,20,18,0.08)]" />
        <div className="absolute left-20 top-11 h-18 w-24 rounded-[1.3rem] bg-foreground/8 shadow-[0_12px_30px_rgba(22,20,18,0.04)]" />
        <div className="absolute bottom-4 left-4 right-4 h-3 rounded-full bg-foreground/10" />
      </div>
    );
  }

  if (variant === "fit") {
    return (
      <div className="grid h-36 gap-3 rounded-[1.5rem] bg-gradient-to-br from-[#f8f5f0] to-[#edf3f3] p-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-accent-4" />
          <div className="h-3 w-28 rounded-full bg-foreground/10" />
        </div>
        <div className="rounded-[1.1rem] bg-white/90 p-4 shadow-[0_12px_24px_rgba(22,20,18,0.06)]">
          <div className="h-2.5 w-24 rounded-full bg-foreground/12" />
          <div className="mt-3 h-2 w-full rounded-full bg-foreground/8" />
          <div className="mt-2 h-2 w-3/4 rounded-full bg-foreground/8" />
        </div>
      </div>
    );
  }

  if (variant === "occasion") {
    return (
      <div className="grid h-36 gap-3 rounded-[1.5rem] bg-gradient-to-br from-[#f8f3ee] to-[#f1f6f6] p-4">
        <div className="flex flex-wrap gap-2">
          {["Reels", "Date", "Office"].map((item) => (
            <span key={item} className="rounded-full border border-line/70 bg-white/90 px-3 py-2 text-xs text-foreground">
              {item}
            </span>
          ))}
        </div>
        <div className="rounded-[1.1rem] bg-white/88 p-4 shadow-[0_12px_24px_rgba(22,20,18,0.05)]">
          <div className="h-2.5 w-20 rounded-full bg-foreground/12" />
          <div className="mt-3 h-2 w-full rounded-full bg-foreground/8" />
          <div className="mt-2 h-2 w-2/3 rounded-full bg-foreground/8" />
        </div>
      </div>
    );
  }

  if (variant === "budget") {
    return (
      <div className="grid h-36 gap-3 rounded-[1.5rem] bg-gradient-to-br from-[#f7f2ec] to-[#ecf3f3] p-4">
        <div className="flex flex-wrap gap-2">
          {["$75-$150", "$150-$250"].map((item, index) => (
            <span
              key={item}
              className={`rounded-full px-3 py-2 text-xs ${index === 1 ? "bg-foreground text-white" : "bg-white/90 text-foreground"}`}
            >
              {item}
            </span>
          ))}
        </div>
        <div className="rounded-[1.1rem] bg-white/90 p-4 shadow-[0_12px_24px_rgba(22,20,18,0.06)]">
          <div className="h-3 rounded-full bg-accent-3/55" />
          <div className="mt-3 h-3 w-3/4 rounded-full bg-accent/25" />
        </div>
      </div>
    );
  }

  if (variant === "links") {
    return (
      <div className="grid h-36 gap-3 rounded-[1.5rem] bg-gradient-to-br from-[#f8f3ee] to-[#edf3f3] p-4">
        <div className="flex gap-2">
          {["Zara", "Mango", "ASOS"].map((item) => (
            <span key={item} className="rounded-full border border-line/70 bg-white/90 px-3 py-2 text-xs text-foreground">
              {item}
            </span>
          ))}
        </div>
        <div className="rounded-[1.1rem] bg-white/90 p-4 shadow-[0_12px_24px_rgba(22,20,18,0.05)]">
          <div className="h-2.5 w-28 rounded-full bg-foreground/12" />
          <div className="mt-3 h-9 rounded-[1rem] bg-foreground/6" />
        </div>
      </div>
    );
  }

  return (
    <div className="grid h-36 gap-3 rounded-[1.5rem] bg-gradient-to-br from-[#f7f2ec] to-[#eef4f4] p-4">
      <div className="rounded-[1.1rem] bg-white/90 p-4 shadow-[0_12px_24px_rgba(22,20,18,0.05)]">
        <div className="flex items-center justify-between">
          <div className="h-2.5 w-20 rounded-full bg-foreground/12" />
          <div className="h-6 w-6 rounded-full bg-accent/20" />
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2">
          <div className="h-10 rounded-[0.9rem] bg-foreground/6" />
          <div className="h-10 rounded-[0.9rem] bg-foreground/6" />
          <div className="h-10 rounded-[0.9rem] bg-foreground/6" />
        </div>
      </div>
      <div className="h-2.5 w-2/3 rounded-full bg-foreground/8" />
    </div>
  );
}

export function FeatureShowcaseCard({
  title,
  description,
  icon: Icon,
  variant,
}: FeatureShowcaseCardProps) {
  return (
    <article className="hero-card hover-lift flex h-full flex-col gap-5 p-5 sm:p-6">
      <FeaturePreview variant={variant} />

      <div>
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-4 text-accent-2">
            <Icon size={18} />
          </span>
          <h3 className="text-2xl text-foreground">{title}</h3>
        </div>
        <p className="mt-4 text-sm leading-6">{description}</p>
      </div>
    </article>
  );
}
