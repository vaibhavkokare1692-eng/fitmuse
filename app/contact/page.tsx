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
            title="Talk to FitMuse about pilots, collabs, or creator partnerships"
            description="A simple contact flow for feedback, waitlists, and sponsor conversations."
          />
          <div className="hidden soft-card sm:block">
            <h2 className="text-2xl text-foreground">Who this is for</h2>
            <p className="mt-4">Creators, early users, brand partners, and anyone interested in the product.</p>
          </div>
        </div>

        <div className="order-1 lg:order-2">
          <ContactForm />
        </div>
      </section>
    </div>
  );
}
