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
    <div className="relative flex w-full flex-col items-start gap-2 sm:w-auto">
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
          className="w-full max-w-sm rounded-[1.3rem] border border-line/70 bg-white/96 px-4 py-3 shadow-[0_16px_32px_rgba(27,21,19,0.08)]"
        >
          <p className="mini-label">MVP note</p>
          <p className="mt-2 text-xs leading-5 text-foreground">
            Shopping links are coming soon. This MVP uses mock products while we prepare real affiliate links.
          </p>
        </div>
      ) : null}
    </div>
  );
}
