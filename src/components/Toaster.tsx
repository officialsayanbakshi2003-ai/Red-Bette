"use client";

import { clsx } from "clsx";
import { CheckCircle2, X, XCircle } from "lucide-react";
import { useToast } from "@/store/toast";

export function Toaster() {
  const { toasts, dismiss } = useToast();
  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-4 z-[80] flex flex-col items-center gap-2 px-4 sm:bottom-6"
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          role="status"
          className={clsx(
            "pointer-events-auto flex w-full max-w-sm animate-fade-up items-center gap-3 border bg-coal/95 px-4 py-3 text-sm shadow-2xl backdrop-blur",
            t.tone === "error" ? "border-blood/60" : "border-line",
          )}
        >
          {t.tone === "success" && <CheckCircle2 className="size-4 shrink-0 text-emerald-600" />}
          {t.tone === "error" && <XCircle className="size-4 shrink-0 text-blood" />}
          <p className="flex-1">{t.message}</p>
          <button onClick={() => dismiss(t.id)} aria-label="Dismiss" className="text-mist hover:text-bone">
            <X className="size-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
