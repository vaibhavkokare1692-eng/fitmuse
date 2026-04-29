"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  CalendarRange,
  Palette,
  Ruler,
  SlidersHorizontal,
  Sparkles,
  User,
} from "lucide-react";
import { useRouter } from "next/navigation";
import {
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  useTransition,
  type ChangeEvent,
  type FormEvent,
} from "react";
import {
  aestheticOptions,
  bodyTypeOptions,
  budgetRangeOptions,
  commonSizes,
  fitPreferenceOptions,
  occasionOptions,
  quickStartTemplates,
  stylePreferenceOptions,
  supportedStoreOptions,
} from "@/data/mock-data";
import {
  buildResultsSearch,
  clearStoredQuizAnswers,
  readStoredQuizAnswers,
  writeStoredQuizAnswers,
} from "@/lib/local-storage";
import { formatAestheticLabel, formatCurrency, formatOptionLabel } from "@/lib/utils";
import { buildOutfitRecommendations, emptyQuizAnswers } from "@/utils/outfitMatcher";
import type { QuizAnswers } from "@/types";

const quizSteps = [
  {
    title: "Style profile",
    description: "A few details to make the styling brief feel personal from the first screen.",
    icon: User,
  },
  {
    title: "Measurements",
    description: "Sizing cues help FitMuse steer toward pieces that are more likely to land well.",
    icon: Ruler,
  },
  {
    title: "Aesthetic",
    description: "Choose the overall vibe you want your outfits to reflect.",
    icon: Palette,
  },
  {
    title: "Occasion and budget",
    description: "Set the moment and the spend range so the recommendations stay realistic.",
    icon: CalendarRange,
  },
  {
    title: "Fit and colors",
    description: "Add your fit preference, color direction, and stores you already like.",
    icon: SlidersHorizontal,
  },
  {
    title: "Review",
    description: "Check the summary and generate your outfit pack.",
    icon: Sparkles,
  },
] as const;

function getStepError(stepIndex: number, values: QuizAnswers) {
  if (stepIndex === 0) {
    if (!values.name.trim() || !values.stylePreference || !values.location.trim()) {
      return "Add your name, style preference, and location so FitMuse can start with a clear brief.";
    }
  }

  if (stepIndex === 1) {
    if (!values.height.trim() || !values.topSize || !values.bottomSize || !values.shoeSize.trim()) {
      return "Add your core measurement details before moving forward.";
    }
  }

  if (stepIndex === 2 && !values.aesthetic) {
    return "Pick one aesthetic so the outfit pack has a clear visual direction.";
  }

  if (stepIndex === 3 && (!values.occasion || !values.budgetRange)) {
    return "Choose an occasion and budget so the results stay useful and realistic.";
  }

  if (stepIndex === 4 && !values.fitPreference) {
    return "Choose how you like clothes to fit so the looks feel closer to your taste.";
  }

  return null;
}

export function QuizForm() {
  const router = useRouter();
  const formSurfaceRef = useRef<HTMLDivElement | null>(null);
  const [isPending, startTransition] = useTransition();
  const savedBrief = useSyncExternalStore(
    () => () => {},
    readStoredQuizAnswers,
    () => null,
  );
  const [savedBriefChoice, setSavedBriefChoice] = useState<"pending" | "continue" | "fresh">(
    "pending",
  );
  const [currentStep, setCurrentStep] = useState(0);
  const [stepError, setStepError] = useState<string | null>(null);
  const [formValues, setFormValues] = useState<QuizAnswers>(emptyQuizAnswers());
  const hasStoredBrief = Boolean(savedBrief);
  const showSavedBriefPrompt = hasStoredBrief && savedBriefChoice === "pending";
  const isUsingSavedBrief = hasStoredBrief && savedBriefChoice === "continue";
  const savedBriefPreview = savedBrief ?? emptyQuizAnswers();

  useEffect(() => {
    if (typeof window === "undefined" || showSavedBriefPrompt) {
      return;
    }

    if (window.innerWidth < 1280) {
      formSurfaceRef.current?.scrollIntoView({ block: "start", behavior: "smooth" });
    }
  }, [currentStep, showSavedBriefPrompt]);

  const previewLooks = buildOutfitRecommendations(formValues, 3);
  const progress = ((currentStep + 1) / quizSteps.length) * 100;

  function handleChange(
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) {
    const { name, value } = event.target;
    setStepError(null);
    setFormValues((current) => ({ ...current, [name]: value }));
  }

  function updateValue(name: keyof QuizAnswers, value: string) {
    setStepError(null);
    setFormValues((current) => ({ ...current, [name]: value }));
  }

  function toggleCommaSeparatedValue(name: keyof QuizAnswers, value: string) {
    setStepError(null);
    setFormValues((current) => {
      const entries = (current[name] ?? "")
        .split(",")
        .map((entry) => entry.trim())
        .filter(Boolean);
      const exists = entries.some((entry) => entry.toLowerCase() === value.toLowerCase());
      const next = exists
        ? entries.filter((entry) => entry.toLowerCase() !== value.toLowerCase())
        : [...entries, value];

      return {
        ...current,
        [name]: next.join(", "),
      };
    });
  }

  function applyQuickStartTemplate(template: (typeof quickStartTemplates)[number]) {
    setStepError(null);
    setFormValues((current) => ({
      ...current,
      ...template.values,
      location: current.location || "United States",
    }));
  }

  function goToStep(nextStep: number) {
    setStepError(null);
    setCurrentStep(Math.max(0, Math.min(nextStep, quizSteps.length - 1)));
  }

  function startNewBrief() {
    clearStoredQuizAnswers();
    setCurrentStep(0);
    setStepError(null);
    setSavedBriefChoice("fresh");
    setFormValues(emptyQuizAnswers());
  }

  function continueSavedBrief() {
    if (savedBrief) {
      setFormValues(savedBrief);
    }

    setSavedBriefChoice("continue");
  }

  function handleNext() {
    const error = getStepError(currentStep, formValues);

    if (error) {
      setStepError(error);
      return;
    }

    goToStep(currentStep + 1);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const error = getStepError(currentStep, formValues);

    if (error) {
      setStepError(error);
      return;
    }

    writeStoredQuizAnswers(formValues);
    const search = buildResultsSearch(formValues);

    startTransition(() => {
      router.push(`/results?${search}`);
    });
  }

  if (showSavedBriefPrompt) {
    return (
      <div className="grid gap-6 xl:grid-cols-[0.84fr_1.16fr]">
        <aside className="dark-panel flex flex-col gap-6 p-6 sm:p-8">
          <div>
            <p className="eyebrow !mb-0 text-accent-3">Saved brief found</p>
            <h2 className="mt-4 text-4xl leading-tight text-white sm:text-5xl">
              Pick up where you left off or start fresh.
            </h2>
            <p className="mt-4 max-w-xl text-white/72">
              FitMuse found a saved style brief in this browser.
            </p>
          </div>

          <div className="rounded-[1.7rem] border border-white/12 bg-white/10 p-5">
            <p className="mini-label !text-white/64">Saved summary</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {[
                savedBriefPreview.aesthetic,
                savedBriefPreview.occasion,
                savedBriefPreview.budgetRange,
                savedBriefPreview.fitPreference,
              ]
                .filter(Boolean)
                .map((item) => (
                  <span key={item} className="rounded-full bg-white/12 px-3 py-2 text-sm text-white/92">
                    {formatOptionLabel(item)}
                  </span>
                ))}
            </div>
            <p className="mt-4 text-sm leading-6 text-white/74">
              {savedBriefPreview.name
                ? `${savedBriefPreview.name}'s saved FitMuse brief is ready to continue.`
                : "Your saved FitMuse brief is ready to continue."}
            </p>
          </div>
        </aside>

        <div className="glass-panel p-6 sm:p-8">
          <div className="grid gap-5 lg:grid-cols-2">
            <button
              type="button"
              onClick={continueSavedBrief}
              className="rounded-[1.8rem] border border-line/70 bg-white/82 p-6 text-left transition hover:-translate-y-0.5 hover:border-accent hover:shadow-[0_18px_36px_rgba(27,21,19,0.08)]"
            >
              <p className="mini-label">Recommended</p>
              <h3 className="mt-3 text-3xl text-foreground">Continue saved brief</h3>
              <p className="mt-3 text-sm leading-6 text-foreground">
                Open the saved multi-step quiz with your previous answers already filled in.
              </p>
            </button>

            <button
              type="button"
              onClick={startNewBrief}
              className="rounded-[1.8rem] border border-line/70 bg-background/84 p-6 text-left transition hover:-translate-y-0.5 hover:border-accent hover:shadow-[0_18px_36px_rgba(27,21,19,0.08)]"
            >
              <p className="mini-label">Fresh start</p>
              <h3 className="mt-3 text-3xl text-foreground">Start new brief</h3>
              <p className="mt-3 text-sm leading-6 text-foreground">
                Clear the saved quiz answers in this browser and begin a new styling brief.
              </p>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-6 xl:grid-cols-[0.82fr_1.18fr]">
      <aside className="order-2 hidden flex-col gap-8 overflow-hidden p-6 sm:p-8 xl:order-1 xl:flex dark-panel">
        <div>
          <p className="eyebrow !mb-0 text-accent-3">Style quiz</p>
          <h2 className="mt-4 text-4xl leading-tight text-white sm:text-5xl">
            Build your personal style brief.
          </h2>
          <p className="mt-4 max-w-xl text-white/72">
            Six quick steps. Save once. Reuse anytime you want complete outfit boards for new plans, budgets, and stores.
          </p>
        </div>

        <div>
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm font-medium text-white/72">
              Step {currentStep + 1} of {quizSteps.length}
            </p>
            <p className="text-sm font-medium text-white/72">{Math.round(progress)}%</p>
          </div>
          <div className="progress-track mt-3 bg-white/12">
            <div className="h-full rounded-full bg-white" style={{ width: `${progress}%` }} />
          </div>
        </div>

        <div className="grid gap-3">
          {quizSteps.map((step, index) => {
            const Icon = step.icon;
            const isActive = index === currentStep;
            const isComplete = index < currentStep;

            return (
              <button
                key={step.title}
                type="button"
                onClick={() => goToStep(index)}
                className={`flex items-center gap-4 rounded-[1.5rem] border px-4 py-4 text-left ${
                  isActive
                    ? "border-white/24 bg-white/14"
                    : "border-white/10 bg-white/6 hover:border-white/18 hover:bg-white/10"
                }`}
              >
                <span
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${
                    isActive || isComplete ? "bg-white text-foreground" : "bg-white/10 text-white"
                  }`}
                >
                  <Icon size={18} />
                </span>
                <div>
                  <p className="text-sm font-semibold text-white">{step.title}</p>
                  <p className="mt-1 text-sm leading-6 text-white/66">{step.description}</p>
                </div>
              </button>
            );
          })}
        </div>

        {previewLooks[0] ? (
          <div className="rounded-[1.7rem] border border-white/12 bg-white/10 p-5">
            <p className="mini-label !text-white/64">Preview look</p>
            <h3 className="mt-3 text-3xl text-white">{previewLooks[0].name}</h3>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="rounded-full bg-white/12 px-3 py-2 text-sm text-white/92">
                {formatAestheticLabel(previewLooks[0].aesthetic, formValues.stylePreference)}
              </span>
              <span className="rounded-full bg-white/12 px-3 py-2 text-sm text-white/92">
                {formatCurrency(previewLooks[0].totalPrice)}
              </span>
            </div>
            <p className="mt-4 text-sm leading-6 text-white/74">
              {previewLooks[0].creatorUseCase}
            </p>
          </div>
        ) : null}
      </aside>

      <div ref={formSurfaceRef} className="order-1 glass-panel p-5 pb-40 sm:p-8 sm:pb-8 xl:order-2">
        <div className="max-w-3xl">
          <p className="mini-label">Current step</p>
          <h3 className="mt-2 text-3xl text-foreground sm:text-5xl">
            {quizSteps[currentStep].title}
          </h3>
          <p className="mt-3 max-w-2xl text-sm leading-6 sm:mt-4 sm:text-base sm:leading-7">
            {quizSteps[currentStep].description}
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <span className="rounded-full border border-line/70 bg-white/82 px-4 py-2 text-sm text-foreground">
              {isUsingSavedBrief ? "Saved brief loaded" : "Fresh brief"}
            </span>
            {isUsingSavedBrief ? (
              <button type="button" onClick={startNewBrief} className="cta-secondary">
                Start new brief
              </button>
            ) : null}
          </div>
        </div>

        {stepError ? (
          <div
            aria-live="polite"
            className="mt-6 rounded-[1.4rem] border border-accent/20 bg-accent/8 px-4 py-3 text-sm text-foreground"
          >
            {stepError}
          </div>
        ) : null}

        <AnimatePresence mode="wait">
          <motion.div
            key={quizSteps[currentStep].title}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            className="mt-6 sm:mt-8"
          >
            {currentStep === 0 ? (
              <div className="grid gap-5 md:grid-cols-2">
                <div className="md:col-span-2 rounded-[1.6rem] border border-line/70 bg-background/74 p-5">
                  <p className="mini-label">Quick-start templates</p>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-foreground">
                    Start with a proven brief instead of building from zero. FitMuse will prefill the vibe, occasion, budget, and store direction for you.
                  </p>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    {quickStartTemplates.map((template) => (
                      <button
                        key={template.id}
                        type="button"
                        onClick={() => applyQuickStartTemplate(template)}
                        className="rounded-[1.35rem] border border-line/70 bg-white/82 p-4 text-left transition hover:-translate-y-0.5 hover:border-accent hover:text-accent"
                      >
                        <p className="text-sm font-semibold text-foreground">{template.label}</p>
                        <p className="mt-2 text-xs leading-5 text-muted">{template.description}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="md:col-span-2">
                  <p className="mini-label">Step 1</p>
                  <p className="mt-2 max-w-2xl text-sm">
                    This becomes the saved profile FitMuse uses on future visits. You do not need to upload a full wardrobe first.
                  </p>
                </div>

                <div>
                  <label htmlFor="name" className="field-label">
                    Name
                  </label>
                  <input
                    id="name"
                    name="name"
                    value={formValues.name}
                    onChange={handleChange}
                    className="field"
                    placeholder="Ava"
                  />
                </div>

                <div>
                  <label htmlFor="stylePreference" className="field-label">
                    Gender or style preference
                  </label>
                  <select
                    id="stylePreference"
                    name="stylePreference"
                    value={formValues.stylePreference}
                    onChange={handleChange}
                    className="field"
                  >
                    <option value="">Choose one</option>
                    {stylePreferenceOptions.map((option) => (
                      <option key={option} value={option}>
                        {formatOptionLabel(option)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="location" className="field-label">
                    Country or location
                  </label>
                  <input
                    id="location"
                    name="location"
                    value={formValues.location}
                    onChange={handleChange}
                    className="field"
                    placeholder="United States"
                  />
                </div>
              </div>
            ) : null}

            {currentStep === 1 ? (
              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {[
                  ["height", "Height", "5'6\""],
                  ["weight", "Weight", "135 lb"],
                  ["chestBust", "Chest / bust", "34 in"],
                  ["waist", "Waist", "27 in"],
                  ["hips", "Hips", "38 in"],
                  ["shoeSize", "Shoe size", "8"],
                ].map(([name, label, placeholder]) => (
                  <div key={name}>
                    <label htmlFor={name} className="field-label">
                      {label}
                    </label>
                    <input
                      id={name}
                      name={name}
                      value={formValues[name as keyof QuizAnswers]}
                      onChange={handleChange}
                      className="field"
                      placeholder={placeholder}
                    />
                  </div>
                ))}

                <div>
                  <label htmlFor="topSize" className="field-label">
                    Usual top size
                  </label>
                  <select
                    id="topSize"
                    name="topSize"
                    value={formValues.topSize}
                    onChange={handleChange}
                    className="field"
                  >
                    <option value="">Choose size</option>
                    {commonSizes.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="bottomSize" className="field-label">
                    Usual bottom size
                  </label>
                  <select
                    id="bottomSize"
                    name="bottomSize"
                    value={formValues.bottomSize}
                    onChange={handleChange}
                    className="field"
                  >
                    <option value="">Choose size</option>
                    {commonSizes.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="bodyType" className="field-label">
                    Body type
                  </label>
                  <select
                    id="bodyType"
                    name="bodyType"
                    value={formValues.bodyType}
                    onChange={handleChange}
                    className="field"
                  >
                    <option value="">Optional</option>
                    {bodyTypeOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ) : null}

            {currentStep === 2 ? (
              <div className="grid gap-6">
                <div>
                  <label className="field-label">Choose your aesthetic</label>
                  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    {aestheticOptions.map((option) => {
                      const selected = formValues.aesthetic === option;

                      return (
                        <button
                          key={option}
                          type="button"
                          onClick={() => updateValue("aesthetic", option)}
                          className={`rounded-[1.4rem] border px-4 py-4 text-left text-sm font-medium ${
                            selected
                              ? "border-foreground bg-foreground text-white"
                              : "border-line/70 bg-white/80 text-foreground hover:border-accent hover:text-accent"
                          }`}
                        >
                          {formatAestheticLabel(option, formValues.stylePreference)}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : null}

            {currentStep === 3 ? (
              <div className="grid gap-6">
                <div>
                  <label className="field-label">Main occasion</label>
                  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
                    {occasionOptions.map((option) => {
                      const selected = formValues.occasion === option;

                      return (
                        <button
                          key={option}
                          type="button"
                          onClick={() => updateValue("occasion", option)}
                          className={`rounded-[1.4rem] border px-4 py-4 text-left text-sm font-medium ${
                            selected
                              ? "border-foreground bg-foreground text-white"
                              : "border-line/70 bg-white/80 text-foreground hover:border-accent hover:text-accent"
                          }`}
                        >
                          {formatOptionLabel(option)}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="field-label">Budget range</label>
                  <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                    {budgetRangeOptions.map((option) => {
                      const selected = formValues.budgetRange === option;

                      return (
                        <button
                          key={option}
                          type="button"
                          onClick={() => updateValue("budgetRange", option)}
                          className={`rounded-[1.4rem] border px-4 py-4 text-left text-sm font-medium ${
                            selected
                              ? "border-foreground bg-foreground text-white"
                              : "border-line/70 bg-white/80 text-foreground hover:border-accent hover:text-accent"
                          }`}
                        >
                          {formatOptionLabel(option)}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : null}

            {currentStep === 4 ? (
              <div className="grid gap-6">
                <div>
                  <label className="field-label">Fit preference</label>
                  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    {fitPreferenceOptions.map((option) => {
                      const selected = formValues.fitPreference === option;

                      return (
                        <button
                          key={option}
                          type="button"
                          onClick={() => updateValue("fitPreference", option)}
                          className={`rounded-[1.4rem] border px-4 py-4 text-left text-sm font-medium ${
                            selected
                              ? "border-foreground bg-foreground text-white"
                              : "border-line/70 bg-white/80 text-foreground hover:border-accent hover:text-accent"
                          }`}
                        >
                          {formatOptionLabel(option)}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <div>
                    <label htmlFor="preferredColors" className="field-label">
                      Preferred colors
                    </label>
                    <textarea
                      id="preferredColors"
                      name="preferredColors"
                      value={formValues.preferredColors}
                      onChange={handleChange}
                      className="field min-h-28"
                      placeholder="cream, espresso, sage"
                    />
                  </div>

                  <div>
                    <label htmlFor="avoidColors" className="field-label">
                      Colors to avoid
                    </label>
                    <textarea
                      id="avoidColors"
                      name="avoidColors"
                      value={formValues.avoidColors}
                      onChange={handleChange}
                      className="field min-h-28"
                      placeholder="neon green"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="storesLike" className="field-label">
                    Stores you like
                  </label>
                  <input
                    id="storesLike"
                    name="storesLike"
                    value={formValues.storesLike}
                    onChange={handleChange}
                    className="field"
                    placeholder="Zara, Mango, ASOS"
                  />
                  <div className="mt-3 flex flex-wrap gap-2">
                    {supportedStoreOptions.map((store) => {
                      const selected = formValues.storesLike
                        .split(",")
                        .map((entry) => entry.trim().toLowerCase())
                        .includes(store.toLowerCase());

                      return (
                        <button
                          key={store}
                          type="button"
                          onClick={() => toggleCommaSeparatedValue("storesLike", store)}
                          className={`rounded-full border px-3 py-2 text-xs font-medium ${
                            selected
                              ? "border-foreground bg-foreground text-white"
                              : "border-line/70 bg-white/82 text-foreground hover:border-accent hover:text-accent"
                          }`}
                        >
                          {store}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : null}

            {currentStep === 5 ? (
              <div className="grid gap-6">
                <div className="grid gap-5 lg:grid-cols-[0.96fr_1.04fr]">
                  <div className="soft-card">
                    <p className="mini-label">Review your brief</p>
                    <h4 className="mt-3 text-3xl text-foreground">
                      {formValues.name ? `${formValues.name}'s FitMuse profile` : "Your FitMuse profile"}
                    </h4>
                    <p className="mt-3 max-w-2xl text-sm leading-6 text-foreground">
                      FitMuse is about to turn your vibe, budget, occasion, colors, fit, and store preferences into complete outfit boards.
                    </p>

                    <div className="mt-5 flex flex-wrap gap-2">
                      {[
                        formValues.aesthetic,
                        formValues.occasion,
                        formValues.budgetRange,
                        formValues.fitPreference,
                        formValues.location,
                      ]
                        .filter(Boolean)
                        .map((item) => (
                          <span key={item} className="chip">
                            {formatOptionLabel(item)}
                          </span>
                        ))}
                    </div>

                    <div className="mt-5 grid gap-3 sm:grid-cols-2">
                      {[
                        { label: "Height", value: formValues.height },
                        { label: "Top size", value: formValues.topSize },
                        { label: "Bottom size", value: formValues.bottomSize },
                        { label: "Shoe size", value: formValues.shoeSize },
                        { label: "Preferred colors", value: formValues.preferredColors || "Open palette" },
                        { label: "Stores", value: formValues.storesLike || "Open to all" },
                      ].map((item) => (
                        <div key={item.label} className="note-card">
                          <p className="mini-label">{item.label}</p>
                          <p className="mt-2 text-sm text-foreground">{item.value}</p>
                        </div>
                        ))}
                    </div>

                    <div className="mt-5 rounded-[1.4rem] border border-line/70 bg-white/78 p-4">
                      <p className="mini-label">Style DNA preview</p>
                      <p className="mt-3 text-sm leading-6 text-foreground">
                        {[
                          formValues.aesthetic
                            ? `${formatAestheticLabel(formValues.aesthetic, formValues.stylePreference).toLowerCase()} base`
                            : "",
                          formValues.fitPreference
                            ? `${formatOptionLabel(formValues.fitPreference).toLowerCase()} fit`
                            : "",
                          formValues.preferredColors
                            ? `${formValues.preferredColors.toLowerCase()} color mood`
                            : "",
                          formValues.storesLike
                            ? `${formValues.storesLike} store mix`
                            : "",
                          formValues.occasion
                            ? `${formatOptionLabel(formValues.occasion).toLowerCase()} focus`
                            : "",
                        ]
                          .filter(Boolean)
                          .join(", ") || "Your brief will get a fuller Style DNA summary on the results page."}
                      </p>
                    </div>
                  </div>

                  <div className="hero-card overflow-hidden p-4">
                    {previewLooks[0] ? (
                      <>
                        <div className="rounded-[1.8rem] bg-gradient-to-br from-[#274650] via-[#6f857b] to-[#ead8c1] p-5 text-white">
                          <p className="mini-label !text-white/70">Top preview look</p>
                          <h4 className="mt-3 text-3xl text-white">{previewLooks[0].name}</h4>
                          <p className="mt-3 text-sm leading-6 text-white/80">
                            {previewLooks[0].fitNote}
                          </p>
                          <div className="mt-4 flex flex-wrap gap-2">
                            <span className="rounded-full bg-white/14 px-3 py-2 text-sm text-white">
                              {formatOptionLabel(previewLooks[0].occasion)}
                            </span>
                            <span className="rounded-full bg-white/14 px-3 py-2 text-sm text-white">
                              {formatCurrency(previewLooks[0].totalPrice)}
                            </span>
                          </div>
                        </div>

                        <div className="mt-4 grid gap-3">
                          {[
                            previewLooks[0].items.top.name,
                            previewLooks[0].items.bottom.name,
                            previewLooks[0].items.shoes.name,
                            previewLooks[0].items.accessory?.name,
                            previewLooks[0].items.outerwear?.name,
                          ]
                            .filter(Boolean)
                            .map((item) => (
                              <div
                                key={item}
                                className="rounded-[1.25rem] border border-line/70 bg-background/82 px-4 py-3 text-sm text-foreground"
                              >
                                {item}
                              </div>
                            ))}
                        </div>
                      </>
                    ) : (
                      <div className="soft-card">
                        <p className="mini-label">Preview</p>
                        <h4 className="mt-3 text-2xl text-foreground">
                          Add a few more details to preview your looks.
                        </h4>
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  {previewLooks.map((look, index) => (
                    <div
                      key={look.id}
                      className="rounded-[1.5rem] border border-line/70 bg-white/82 p-4"
                    >
                      <p className="mini-label">Look {index + 1}</p>
                      <h4 className="mt-2 text-2xl text-foreground">{look.name}</h4>
                      <p className="mt-2 text-sm">{look.creatorUseCase}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </motion.div>
        </AnimatePresence>

        <div className="fixed inset-x-4 bottom-12 z-40 flex flex-col gap-4 rounded-[1.5rem] border border-line/70 bg-[rgba(252,247,242,0.94)] p-4 shadow-[0_18px_36px_rgba(27,21,19,0.12)] backdrop-blur-sm sm:static sm:mt-8 sm:flex-row sm:items-center sm:justify-between sm:rounded-none sm:border-t sm:border-x-0 sm:border-b-0 sm:bg-transparent sm:p-0 sm:pt-6 sm:shadow-none sm:backdrop-blur-0">
          <button
            type="button"
            onClick={() => goToStep(currentStep - 1)}
            className="cta-secondary"
            data-testid="quiz-back-button"
            disabled={currentStep === 0}
          >
            Back
          </button>

          {currentStep < quizSteps.length - 1 ? (
            <button
              type="button"
              onClick={handleNext}
              className="cta-primary"
              data-testid="quiz-next-button"
            >
              <span className="flex items-center gap-2">
                Next
                <ArrowRight size={15} />
              </span>
            </button>
          ) : (
            <button
              type="submit"
              className="cta-primary min-w-56"
              data-testid="quiz-submit-button"
              disabled={isPending}
            >
              {isPending ? "Generating your looks..." : "Generate My Looks"}
            </button>
          )}
        </div>
      </div>
    </form>
  );
}
