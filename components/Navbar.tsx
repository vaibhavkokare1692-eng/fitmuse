"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { brandName, headerTagline, navLinks } from "@/data/mock-data";

export function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-background/75 pt-4 backdrop-blur-xl">
      <div className="shell">
        <div className="hero-card flex items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Link href="/" className="flex items-center gap-3" onClick={() => setIsOpen(false)}>
            <div>
              <p className="text-xl font-semibold text-foreground">{brandName}</p>
              <p className="text-[11px] uppercase tracking-[0.28em] text-muted">
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

          <div className="flex items-center gap-3">
            <Link href="/quiz" className="cta-primary hidden lg:inline-flex">
              Take Quiz
            </Link>
            <button
              type="button"
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-line bg-white/86 text-sm font-semibold text-foreground xl:hidden"
              onClick={() => setIsOpen((current) => !current)}
              aria-expanded={isOpen}
              aria-label="Toggle navigation menu"
            >
              {isOpen ? "Close" : "Menu"}
            </button>
          </div>
        </div>
      </div>

      {isOpen ? (
        <div className="shell pb-4 xl:hidden">
          <div className="hero-card mt-4 flex flex-col gap-2 p-4">
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
