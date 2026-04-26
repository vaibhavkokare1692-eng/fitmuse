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
        <div className="h-2.5 w-20 rounded-full bg-foreground/12" />
        <div className="mt-4 grid gap-3">
          <div className="h-11 rounded-[1rem] bg-foreground/6" />
          <div className="h-11 rounded-[1rem] bg-foreground/6" />
          <div className="h-11 rounded-[1rem] bg-accent-2/12" />
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
          <div className="h-20 rounded-[1rem] bg-foreground/6" />
          <div className="h-20 rounded-[1rem] bg-foreground/6" />
          <div className="h-20 rounded-[1rem] bg-foreground/6" />
          <div className="h-20 rounded-[1rem] bg-accent-3/35" />
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
      <div className="mt-3 h-10 rounded-[1rem] bg-foreground/6" />
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
