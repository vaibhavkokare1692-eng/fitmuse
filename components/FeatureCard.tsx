import type { Feature } from "@/types";

type FeatureCardProps = {
  feature: Feature;
};

export function FeatureCard({ feature }: FeatureCardProps) {
  return (
    <article className="editorial-card group relative h-full overflow-hidden">
      <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-accent-3/35 blur-2xl transition duration-300 group-hover:scale-110" />
      <div className="relative">
        <div className="mb-5 flex items-center justify-between gap-4">
          <p className="eyebrow !mb-0">{feature.eyebrow}</p>
          <span className="flex h-11 w-11 items-center justify-center rounded-full border border-line/70 bg-background/85 text-sm font-semibold text-foreground">
            {feature.title.charAt(0)}
          </span>
        </div>
        <h3 className="max-w-xs text-2xl text-foreground">{feature.title}</h3>
        <p className="mt-4">{feature.description}</p>
      </div>
    </article>
  );
}
