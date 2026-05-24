"use client";

type AppPreviewVariant = "quiz" | "result" | "saved" | "filters";

type AppPreviewTileProps = {
  label: string;
  title: string;
  variant: AppPreviewVariant;
};

function TilePreview({ variant }: { variant: AppPreviewVariant }) {
  if (variant === "quiz") {
    return (
      <div className="rounded-[1.45rem] bg-white/92 p-4 shadow-[0_12px_28px_rgba(22,20,18,0.05)]">
        <div className="h-2.5 w-20 rounded-full bg-accent-2/24" />
        <div className="mt-4 grid gap-3">
          {["Occasion", "Budget", "Stores"].map((label) => (
            <div
              key={label}
              className="rounded-[1rem] border border-line/60 bg-background/74 px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-foreground/68"
            >
              {label}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (variant === "result") {
    return (
      <div className="rounded-[1.45rem] bg-white/92 p-4 shadow-[0_12px_28px_rgba(22,20,18,0.05)]">
        <div className="h-24 rounded-[1.1rem] bg-gradient-to-br from-[#274650] via-[#6a8076] to-[#e6d1b8]" />
        <div className="mt-4 h-3 w-24 rounded-full bg-foreground/12" />
        <div className="mt-3 flex gap-2">
          <div className="h-8 w-16 rounded-full bg-foreground/6" />
          <div className="h-8 w-20 rounded-full bg-foreground/6" />
        </div>
      </div>
    );
  }

  if (variant === "saved") {
    return (
      <div className="rounded-[1.45rem] bg-white/92 p-4 shadow-[0_12px_28px_rgba(22,20,18,0.05)]">
        <div className="grid grid-cols-2 gap-3">
          {["Date", "Travel", "Office", "Shoot"].map((label) => (
            <div
              key={label}
              className="flex min-h-16 items-end rounded-[1rem] border border-line/60 bg-gradient-to-br from-foreground/6 to-accent-3/24 p-2.5 sm:min-h-20 sm:p-3"
            >
              <span className="text-[10px] font-semibold leading-tight text-foreground/70 sm:uppercase sm:tracking-[0.14em]">
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-[1.45rem] bg-white/92 p-4 shadow-[0_12px_28px_rgba(22,20,18,0.05)]">
      <div className="flex flex-wrap gap-2">
        {["Aesthetic", "Budget", "Fit"].map((item) => (
          <div key={item} className="rounded-full border border-line/70 bg-background/88 px-3 py-2 text-xs text-foreground">
            {item}
          </div>
        ))}
      </div>
      <div className="mt-4 h-10 rounded-[1rem] bg-foreground/6" />
      <div className="mt-3 rounded-[1rem] border border-line/70 bg-background/82 px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-foreground/68">
        Store match
      </div>
    </div>
  );
}

export function AppPreviewTile({ label, title, variant }: AppPreviewTileProps) {
  return (
    <article className="hero-card hover-lift flex h-full flex-col gap-5 p-5">
      <div className="rounded-[1.7rem] bg-gradient-to-br from-[#f8f3ec] to-[#edf3f3] p-4">
        <TilePreview variant={variant} />
      </div>
      <div>
        <p className="mini-label">{label}</p>
        <h3 className="mt-2 text-2xl text-foreground">{title}</h3>
      </div>
    </article>
  );
}
