type SectionHeadingProps = {
  eyebrow: string;
  title: string;
  description: string;
  centered?: boolean;
};

export function SectionHeading({
  eyebrow,
  title,
  description,
  centered = false,
}: SectionHeadingProps) {
  return (
    <div className={centered ? "mx-auto max-w-3xl text-center" : "max-w-3xl"}>
      <div className={`mb-4 flex items-center gap-3 ${centered ? "justify-center" : ""}`}>
        <span className="h-px w-12 bg-accent-2/45" />
        <p className="eyebrow !mb-0">{eyebrow}</p>
      </div>
      <h2 className="section-title text-foreground">{title}</h2>
      <p className={centered ? "mx-auto mt-5 max-w-2xl" : "mt-5 max-w-2xl"}>{description}</p>
    </div>
  );
}
