"use client";

import { useTransition } from "react";

/** A small button that runs a server action, with an optional confirmation. */
export function ActionButton({
  action,
  children,
  confirmText,
  className,
}: {
  action: () => Promise<unknown>;
  children: React.ReactNode;
  confirmText?: string;
  className?: string;
}) {
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (confirmText && !confirm(confirmText)) return;
        start(async () => {
          await action();
        });
      }}
      className={className ?? "text-xs text-mist underline-offset-4 hover:text-bone hover:underline disabled:opacity-50"}
    >
      {children}
    </button>
  );
}
