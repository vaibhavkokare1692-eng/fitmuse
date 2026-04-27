"use client";

import { useState } from "react";
import { ExternalLink } from "lucide-react";

type ShoppingLinksButtonProps = {
  className?: string;
  testId?: string;
};

export function ShoppingLinksButton({
  className = "cta-primary",
  testId = "shop-look-button",
}: ShoppingLinksButtonProps) {
  const [showMessage, setShowMessage] = useState(false);

  return (
    <div className="relative flex flex-col items-start gap-2">
      <button
        type="button"
        className={className}
        onClick={() => setShowMessage((current) => !current)}
        aria-expanded={showMessage}
        data-testid={testId}
      >
        <span className="flex items-center gap-2">
          Shop look
          <ExternalLink size={14} />
        </span>
      </button>

      {showMessage ? (
        <div
          data-testid={`${testId}-message`}
          className="max-w-xs rounded-[1.2rem] border border-line/70 bg-white/96 px-4 py-3 text-xs leading-5 text-foreground shadow-[0_16px_32px_rgba(27,21,19,0.08)]"
        >
          Shopping links are coming soon. This MVP uses mock products while we prepare real affiliate links.
        </div>
      ) : null}
    </div>
  );
}
