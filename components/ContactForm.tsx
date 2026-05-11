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

const feedbackPrompts = [
  "What brief did you try?",
  "Which board felt useful or off?",
  "What felt confusing, fake, or missing?",
  "What board should FitMuse add next?",
];

export function ContactForm() {
  return (
    <div className="glass-panel p-6 sm:p-8">
      <p className="eyebrow">Early feedback mode</p>
      <h2 className="mt-3 text-4xl leading-tight text-foreground">
        Help shape the next FitMuse boards.
      </h2>
      <p className="mt-4 max-w-2xl text-sm leading-6 text-muted">
        FitMuse is collecting real feedback before a wider launch. Send what you tried,
        what worked, what felt confusing or fake, and what style board you want next.
      </p>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {feedbackPrompts.map((prompt) => (
          <div key={prompt} className="note-card">
            <p className="text-sm text-foreground">{prompt}</p>
          </div>
        ))}
      </div>

      <div className="mt-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <a href={feedbackMailtoHref} className="cta-primary min-w-44 text-center">
          Email FitMuse feedback
        </a>
        <p className="text-sm leading-6 text-muted">
          Opens your email app to{" "}
          <span className="font-semibold text-foreground">{feedbackEmail}</span>.
        </p>
      </div>
    </div>
  );
}
