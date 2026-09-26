"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/**
 * Fades elements marked with data-reveal into view as they scroll in.
 * Without JavaScript nothing is hidden, so content is always reachable.
 */
export function RevealObserver() {
  const pathname = usePathname();

  useEffect(() => {
    const root = document.documentElement;
    root.classList.add("js-reveal");
    if (!("IntersectionObserver" in window)) {
      document.querySelectorAll("[data-reveal]").forEach((el) => el.classList.add("is-visible"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
    );
    const observeAll = () =>
      document.querySelectorAll("[data-reveal]:not(.is-visible)").forEach((el) => io.observe(el));
    observeAll();
    const mo = new MutationObserver(observeAll);
    mo.observe(document.body, { childList: true, subtree: true });
    return () => {
      io.disconnect();
      mo.disconnect();
    };
  }, [pathname]);

  return null;
}
