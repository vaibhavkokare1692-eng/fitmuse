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
        <div className="space-y-6">
          <SectionHeading
            eyebrow="Contact"
            title="Talk to FitMuse about pilots, collabs, or creator partnerships"
            description="A simple contact flow for feedback, waitlists, and sponsor conversations."
          />
          <div className="soft-card">
            <h2 className="text-2xl text-foreground">Who this is for</h2>
            <p className="mt-4">Creators, early users, brand partners, and anyone interested in the product.</p>
          </div>
        </div>

        <ContactForm />
      </section>
    </div>
  );
}
