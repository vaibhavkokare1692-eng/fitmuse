"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";

type ContactFormState = {
  name: string;
  email: string;
  message: string;
  isCreator: boolean;
};

const initialState: ContactFormState = {
  name: "",
  email: "",
  message: "",
  isCreator: false,
};

export function ContactForm() {
  const [formState, setFormState] = useState<ContactFormState>(initialState);
  const [isSubmitted, setIsSubmitted] = useState(false);

  function handleTextChange(
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) {
    const { name, value } = event.target;
    setFormState((current) => ({ ...current, [name]: value }));
  }

  function handleCheckboxChange(event: ChangeEvent<HTMLInputElement>) {
    setFormState((current) => ({ ...current, isCreator: event.target.checked }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitted(true);
    setFormState(initialState);
  }

  return (
    <form onSubmit={handleSubmit} className="glass-panel p-6 sm:p-8">
      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label htmlFor="contact-name" className="field-label">
            Name
          </label>
          <input
            id="contact-name"
            name="name"
            value={formState.name}
            onChange={handleTextChange}
            className="field"
            placeholder="Your name"
            required
          />
        </div>
        <div>
          <label htmlFor="contact-email" className="field-label">
            Email
          </label>
          <input
            id="contact-email"
            type="email"
            name="email"
            value={formState.email}
            onChange={handleTextChange}
            className="field"
            placeholder="you@example.com"
            required
          />
        </div>
      </div>

      <div className="mt-5">
        <label htmlFor="contact-message" className="field-label">
          Message
        </label>
        <textarea
          id="contact-message"
          name="message"
          value={formState.message}
          onChange={handleTextChange}
          className="field min-h-40"
          placeholder="Tell us what kind of styling support or partnership interest you have."
          required
        />
      </div>

      <label className="mt-5 flex items-center gap-3 rounded-2xl border border-line/70 bg-white/80 p-4 text-sm text-foreground">
        <input
          type="checkbox"
          checked={formState.isCreator}
          onChange={handleCheckboxChange}
          className="h-4 w-4 accent-[color:var(--accent)]"
        />
        I am an influencer/content creator
      </label>

      <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <button type="submit" className="cta-primary min-w-40">
          Send message
        </button>
        {isSubmitted ? (
          <p className="text-sm text-accent-2">
            Thanks — this demo keeps messages local for now.
          </p>
        ) : (
          <p className="text-sm text-muted">
            This MVP keeps submission local, so there is no backend dependency yet.
          </p>
        )}
      </div>
    </form>
  );
}
