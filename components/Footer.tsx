import Link from "next/link";
import { brandName, brandTagline, headerTagline, navLinks } from "@/data/mock-data";

export function Footer() {
  const primaryLinks = navLinks.slice(0, 4);
  const secondaryLinks = navLinks.slice(4);

  return (
    <footer className="pb-8 pt-10">
      <div className="shell">
        <div className="hero-card grid gap-10 p-8 lg:grid-cols-[1.1fr_0.9fr_0.9fr]">
          <div className="space-y-5">
            <div>
              <p className="text-2xl font-semibold text-foreground">{brandName}</p>
              <p className="text-[11px] uppercase tracking-[0.28em] text-muted">
                {headerTagline}
              </p>
            </div>
            <p className="max-w-xl text-lg leading-8 text-foreground">
              {brandTagline}
            </p>
          </div>

          <div>
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.24em] text-muted">
              Explore
            </p>
            <div className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
              {primaryLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm text-foreground hover:text-accent"
                >
                  {link.label}
                </Link>
              ))}
              {secondaryLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm text-foreground hover:text-accent"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.24em] text-muted">
              MVP note
            </p>
            <p>
              FitMuse uses mock outfit data and placeholder shopping links right now, so it stays
              easy to evolve into a real affiliate and recommendation product later.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
