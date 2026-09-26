"use client";

import { ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { SORTS, type SortKey } from "@/lib/catalog-constants";

export function SortSelect({ value, hrefs }: { value: SortKey; hrefs: Record<SortKey, string> }) {
  const router = useRouter();
  return (
    <label className="relative flex items-center gap-2 text-xs">
      <span className="eyebrow hidden sm:inline">Sort</span>
      <select
        value={value}
        onChange={(e) => router.push(hrefs[e.target.value as SortKey], { scroll: false })}
        className="h-10 appearance-none border border-line bg-coal py-0 pl-3 pr-9 font-display text-[0.7rem] uppercase tracking-[0.15em] outline-none hover:border-bone/50 focus:border-bone"
        aria-label="Sort products"
      >
        {(Object.keys(SORTS) as SortKey[]).map((key) => (
          <option key={key} value={key}>
            {SORTS[key].label}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 size-3.5 text-mist" />
    </label>
  );
}
