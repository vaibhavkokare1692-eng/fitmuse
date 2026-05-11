import Link from "next/link";
import { brandName, brandTagline, headerTagline, navLinks } from "@/data/mock-data";

const feedbackEmail = "hello.fitmuse@gmail.com";
const feedbackSubject = "FitMuse feedback";
const feedbackBody = [
  "What were you trying to dress for?",
  "",
  "Did the outfit board feel useful?",
  "",
  "What felt confusing or fake?",
  "",
  "What board/style should FitMuse add next?",
].join("\n");

const feedbackMailtoHref = `mailto:${feedbackEmail}?subject=${encodeURIComponent(
  feedbackSubject
)}&body=${encodeURIComponent(feedbackBody)}`;

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
              FitMuse currently combines sample outfit boards with a smaller set of manually
              reviewed retailer-candidate boards. Retailer candidates still require manual
              verification before purchase.
            </p>
            <div className="mt-5 rounded-[1.35rem] border border-line/70 bg-white/78 p-4">
              <p className="mini-label">Feedback</p>
              <p className="mt-2 text-sm leading-6 text-muted">
                Trying FitMuse with a real brief? Send what worked, what felt confusing, and
                what board should come next.
              </p>
              <a
                href={feedbackMailtoHref}
                className="mt-4 inline-flex text-sm font-semibold text-accent-2 underline-offset-4 hover:text-accent hover:underline"
              >
                Email feedback
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
