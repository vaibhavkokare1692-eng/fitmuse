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
    <footer className="pb-6 pt-6 sm:pb-8 sm:pt-10">
      <div className="shell">
        <div className="hero-card grid gap-6 p-5 sm:gap-10 sm:p-8 lg:grid-cols-[1.1fr_0.9fr_0.9fr]">
          <div className="space-y-3 sm:space-y-5">
            <div>
              <p className="text-2xl font-semibold text-foreground">{brandName}</p>
              <p className="text-[11px] uppercase tracking-[0.28em] text-muted">
                {headerTagline}
              </p>
            </div>
            <p className="max-w-xl text-base leading-7 text-foreground sm:text-lg sm:leading-8">
              {brandTagline}
            </p>
          </div>

          <div>
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.24em] text-muted sm:mb-4">
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
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.24em] text-muted sm:mb-4">
              MVP note
            </p>
            <p className="text-sm leading-6">
              FitMuse combines sample boards with manually reviewed retailer-candidate boards.
              Verify retailer prices and availability before purchase.
            </p>
            <div className="mt-4 rounded-[1.35rem] border border-line/70 bg-white/78 p-4 sm:mt-5">
              <p className="mini-label">Feedback</p>
              <p className="mt-2 text-sm leading-6 text-muted">
                Send what worked, what felt confusing, and what board should come next.
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
