"use client";

import { clsx } from "clsx";
import { X } from "lucide-react";
import { useEffect, useRef } from "react";

let openSheets = 0;

function lockScroll() {
  openSheets++;
  if (openSheets === 1) {
    const scrollbar = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = "hidden";
    if (scrollbar > 0) document.body.style.paddingRight = `${scrollbar}px`;
  }
}
function unlockScroll() {
  openSheets = Math.max(0, openSheets - 1);
  if (openSheets === 0) {
    document.body.style.overflow = "";
    document.body.style.paddingRight = "";
  }
}

/** Slide-over panel with overlay, Escape to close, focus trapping and scroll lock. */
export function Sheet({
  open,
  onClose,
  side = "right",
  title,
  children,
  className,
  hideHeader = false,
}: {
  open: boolean;
  onClose: () => void;
  side?: "left" | "right" | "top";
  title: string;
  children: React.ReactNode;
  className?: string;
  hideHeader?: boolean;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    if (!open) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    lockScroll();
    const panel = panelRef.current;
    const focusables = () =>
      Array.from(
        panel?.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])',
        ) ?? [],
      ).filter((el) => el.offsetParent !== null);
    const first = focusables()[0];
    (panel?.querySelector<HTMLElement>("[data-autofocus]") ?? first ?? panel)?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onCloseRef.current();
      } else if (e.key === "Tab") {
        const els = focusables();
        if (els.length === 0) return;
        const firstEl = els[0]!;
        const lastEl = els[els.length - 1]!;
        if (e.shiftKey && document.activeElement === firstEl) {
          e.preventDefault();
          lastEl.focus();
        } else if (!e.shiftKey && document.activeElement === lastEl) {
          e.preventDefault();
          firstEl.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      unlockScroll();
      previouslyFocused?.focus?.();
    };
  }, [open]);

  return (
    <div className={clsx("fixed inset-0 z-[70]", open ? "visible" : "invisible")} aria-hidden={!open}>
      <div
        className={clsx(
          "absolute inset-0 bg-black/70 backdrop-blur-[2px] transition-opacity duration-300",
          open ? "opacity-100" : "opacity-0",
        )}
        onClick={onClose}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        className={clsx(
          "absolute flex flex-col bg-coal shadow-2xl outline-none transition-transform duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)]",
          side === "right" && "inset-y-0 right-0 w-full max-w-md border-l border-line",
          side === "left" && "inset-y-0 left-0 w-full max-w-md border-r border-line",
          side === "top" && "inset-x-0 top-0 border-b border-line",
          side === "right" && (open ? "translate-x-0" : "translate-x-full"),
          side === "left" && (open ? "translate-x-0" : "-translate-x-full"),
          side === "top" && (open ? "translate-y-0" : "-translate-y-full"),
          className,
        )}
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        {!hideHeader && (
          <div className="flex h-16 shrink-0 items-center justify-between border-b border-line px-5">
            <p className="font-display text-sm font-semibold uppercase tracking-[0.25em]">{title}</p>
            <button
              type="button"
              onClick={onClose}
              className="-mr-2 grid size-10 place-items-center text-mist hover:text-bone"
              aria-label="Close"
            >
              <X className="size-5" />
            </button>
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
