"use client";

import { useState } from "react";
import { ExternalLink } from "lucide-react";

type ShoppingLinksButtonProps = {
  className?: string;
};

export function ShoppingLinksButton({
  className = "cta-primary",
}: ShoppingLinksButtonProps) {
  const [showMessage, setShowMessage] = useState(false);

  return (
    <div className="flex flex-col items-start gap-2">
      <button
        type="button"
        className={className}
        onClick={() => setShowMessage((current) => !current)}
        aria-expanded={showMessage}
      >
        <span className="flex items-center gap-2">
          Shop look
          <ExternalLink size={14} />
        </span>
      </button>

      {showMessage ? (
        <p className="rounded-full border border-line/70 bg-white/88 px-3 py-2 text-xs text-foreground">
          Shopping links coming soon.
        </p>
      ) : null}
    </div>
  );
}
