"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { brandName, headerTagline, navLinks } from "@/data/mock-data";

export function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-background/75 pt-3 backdrop-blur-xl sm:pt-4">
      <div className="shell">
        <div className="hero-card flex items-center justify-between gap-2 px-3 py-3 sm:gap-4 sm:px-6">
          <Link href="/" className="flex min-w-0 items-center gap-3" onClick={() => setIsOpen(false)}>
            <div className="min-w-0">
              <p className="text-xl font-semibold text-foreground">{brandName}</p>
              <p className="truncate text-[10px] uppercase tracking-[0.18em] text-muted sm:text-[11px] sm:tracking-[0.28em]">
                {headerTagline}
              </p>
            </div>
          </Link>

          <nav className="hidden items-center gap-1 xl:flex">
            {navLinks.map((link) => {
              const active = pathname === link.href;

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`rounded-full px-3 py-2 text-[13px] font-medium ${
                    active
                      ? "bg-foreground text-white"
                      : "text-foreground hover:bg-white/75 hover:text-accent"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex shrink-0 items-center gap-3">
            <Link href="/quiz" className="cta-primary hidden lg:inline-flex">
              Take Quiz
            </Link>
            <button
              type="button"
              className="inline-flex h-11 shrink-0 items-center gap-1.5 rounded-full border border-line bg-white/86 px-2.5 text-foreground shadow-[0_12px_24px_rgba(27,21,19,0.05)] sm:gap-2 sm:px-3 xl:hidden"
              onClick={() => setIsOpen((current) => !current)}
              aria-expanded={isOpen}
              aria-label="Toggle navigation menu"
            >
              <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted sm:text-[11px] sm:tracking-[0.24em]">
                {isOpen ? "Close" : "Menu"}
              </span>
              <span className="relative h-4 w-4" aria-hidden="true">
                <span
                  className={`absolute left-0 top-1/2 h-[1.5px] w-4 -translate-y-1/2 rounded-full bg-foreground transition ${
                    isOpen ? "rotate-45" : "-translate-y-[6px]"
                  }`}
                />
                <span
                  className={`absolute left-0 top-1/2 h-[1.5px] w-4 -translate-y-1/2 rounded-full bg-foreground transition ${
                    isOpen ? "opacity-0" : "opacity-100"
                  }`}
                />
                <span
                  className={`absolute left-0 top-1/2 h-[1.5px] w-4 -translate-y-1/2 rounded-full bg-foreground transition ${
                    isOpen ? "-rotate-45" : "translate-y-[6px]"
                  }`}
                />
              </span>
            </button>
          </div>
        </div>
      </div>

      {isOpen ? (
        <div className="shell pb-4 xl:hidden">
          <div className="hero-card mt-4 flex flex-col gap-2 p-3 sm:p-4">
            {navLinks.map((link) => {
              const active = pathname === link.href;

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`rounded-2xl px-4 py-3 text-sm font-medium ${
                    active
                      ? "bg-foreground text-white"
                      : "bg-white/60 text-foreground hover:bg-white hover:text-accent"
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  {link.label}
                </Link>
              );
            })}

            <Link href="/quiz" className="cta-primary mt-2" onClick={() => setIsOpen(false)}>
              Take Quiz
            </Link>
          </div>
        </div>
      ) : null}
    </header>
  );
}
