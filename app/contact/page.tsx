import type { Metadata } from "next";
import { ContactForm } from "@/components/ContactForm";
import { SectionHeading } from "@/components/SectionHeading";

export const metadata: Metadata = {
  title: "Contact",
};

export default function ContactPage() {
  return (
    <div className="shell section-space">
      <section className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
        <div className="order-2 space-y-6 lg:order-1">
          <SectionHeading
            eyebrow="Contact"
            title="Send real feedback before FitMuse goes wider"
            description="Tell us what you tried, what felt useful, what felt confusing, and what board you want next."
          />
          <div className="hidden soft-card sm:block">
            <h2 className="text-2xl text-foreground">Who this is for</h2>
            <p className="mt-4">
              Early users, creators, friends testing the product, and anyone with honest notes on
              the brief-to-board flow.
            </p>
          </div>
        </div>

        <div className="order-1 lg:order-2">
          <ContactForm />
        </div>
      </section>
    </div>
  );
}
