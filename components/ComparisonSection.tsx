import { comparisonRows } from "@/data/mock-data";
import { SectionHeading } from "@/components/SectionHeading";

type ComparisonSectionProps = {
  showIntro?: boolean;
  contained?: boolean;
};

export function ComparisonSection({
  showIntro = true,
  contained = true,
}: ComparisonSectionProps) {
  const content = (
    <div>
      {showIntro ? (
        <SectionHeading
          eyebrow="Why it feels different"
          title="A practical outfit-board stylist, not another closet-heavy fashion tool"
          description="FitMuse is built around complete outfit discovery, not closet organization, single-brand selling, or expensive human styling."
        />
      ) : null}

      <div className={`${showIntro ? "mt-10" : ""} grid gap-4`}>
        {comparisonRows.map((row, index) => (
          <article
            key={row.legacy}
            className="grid gap-4 rounded-[2rem] border border-white/80 bg-white/78 p-5 shadow-[0_20px_70px_rgba(57,38,28,0.07)] md:grid-cols-[auto_1fr_1fr]"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-foreground text-sm font-semibold text-white">
              {String(index + 1).padStart(2, "0")}
            </div>

            <div className="rounded-[1.5rem] bg-background/88 p-5">
              <p className="mini-label">Existing tools</p>
              <p className="mt-3 text-sm leading-6 text-foreground">{row.legacy}</p>
            </div>

            <div className="rounded-[1.5rem] bg-accent-4 p-5">
              <p className="mini-label !text-accent-2">FitMuse</p>
              <p className="mt-3 text-sm leading-6 text-foreground">{row.modern}</p>
            </div>
          </article>
        ))}
      </div>
    </div>
  );

  if (!contained) {
    return content;
  }

  return (
    <section className="section-space">
      <div className="shell">{content}</div>
    </section>
  );
}
